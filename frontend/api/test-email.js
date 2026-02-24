import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

function getSafeSender(provider) {
  const name  = provider.sender_name  || 'Nisha Goriel Photography';
  const email = provider.sender_email || '';
  const badDomains = ['example.com', 'example.org', 'test.com', 'localhost', ''];
  const domain = email.split('@')[1] || '';
  const finalEmail = email && !badDomains.includes(domain) ? email : 'onboarding@resend.dev';
  return { name, email: finalEmail, from: `${name} <${finalEmail}>` };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing recipient email' });

  let settings = null;
  try {
    const { data, error } = await supabase
      .from('settings').select('email_provider').eq('id', 'site_settings').single();
    if (error) console.error('Settings fetch error:', error);
    else settings = data;
  } catch (e) { console.error('Supabase error:', e); }

  const provider    = settings?.email_provider || {};
  const sender      = getSafeSender(provider);
  const subject     = '✅ Test – E-postkonfiguration fungerar!';
  const html        = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;border:1px solid #eee;border-radius:8px;">
      <h2 style="color:#333;margin-top:0;">✅ Testmejl lyckades!</h2>
      <p style="color:#555;">Din e-postkonfiguration fungerar korrekt.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:6px 0;color:#888;font-size:13px;">Leverantör:</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${provider.provider || 'resend'}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px;">Avsändare:</td><td style="padding:6px 0;font-size:13px;">${sender.from}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px;">Mottagare:</td><td style="padding:6px 0;font-size:13px;">${to}</td></tr>
      </table>
      <p style="color:#aaa;font-size:12px;margin-top:24px;">Automatiskt testmejl från Nisha Goriel Photography Admin Panel.</p>
    </div>`;

  console.log('test-email:', { provider: provider.provider, from: sender.from, to });

  try {
    switch (provider.provider) {

      case 'resend': {
        const key = provider.api_key || process.env.RESEND_API_KEY;
        if (!key) return res.status(500).json({ error: 'Resend: API-nyckel saknas. Lägg till den under Inställningar → E-postleverantör.' });
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: sender.from, to: [to], subject, html }),
        });
        const d = await r.json();
        if (!r.ok) { console.error('Resend test error:', d); return res.status(400).json({ error: d.message || JSON.stringify(d) }); }
        return res.status(200).json({ success: true });
      }

      case 'mailtrap': {
        const key = provider.api_key;
        if (!key) return res.status(500).json({ error: 'Mailtrap: API-nyckel saknas' });
        const r = await fetch('https://send.api.mailtrap.io/api/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: { name: sender.name, email: sender.email }, to: [{ email: to }], subject, html }),
        });
        const d = await r.json();
        if (!r.ok) return res.status(400).json({ error: d.errors?.[0] || JSON.stringify(d) });
        return res.status(200).json({ success: true });
      }

      case 'sendgrid': {
        const key = provider.api_key;
        if (!key) return res.status(500).json({ error: 'SendGrid: API-nyckel saknas' });
        const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { name: sender.name, email: sender.email }, subject, content: [{ type: 'text/html', value: html }] }),
        });
        if (!r.ok) { const d = await r.json(); return res.status(400).json({ error: d.errors?.[0]?.message || JSON.stringify(d) }); }
        return res.status(200).json({ success: true });
      }

      case 'mailgun': {
        const key = provider.api_key; const domain = provider.domain;
        if (!key || !domain) return res.status(500).json({ error: 'Mailgun: API-nyckel och domän krävs' });
        const form = new URLSearchParams();
        form.append('from', sender.from); form.append('to', to); form.append('subject', subject); form.append('html', html);
        const r = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
          method: 'POST',
          headers: { Authorization: `Basic ${Buffer.from(`api:${key}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        });
        const d = await r.json();
        if (!r.ok) return res.status(400).json({ error: d.message || JSON.stringify(d) });
        return res.status(200).json({ success: true });
      }

      case 'brevo': {
        const key = provider.api_key;
        if (!key) return res.status(500).json({ error: 'Brevo: API-nyckel saknas' });
        const r = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: { name: sender.name, email: sender.email }, to: [{ email: to }], subject, htmlContent: html }),
        });
        const d = await r.json();
        if (!r.ok) return res.status(400).json({ error: d.message || JSON.stringify(d) });
        return res.status(200).json({ success: true });
      }

      case 'mailjet': {
        const key = provider.api_key; const secret = provider.api_secret;
        if (!key || !secret) return res.status(500).json({ error: 'Mailjet: API-nyckel och secret krävs' });
        const r = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ Messages: [{ From: { Email: sender.email, Name: sender.name }, To: [{ Email: to }], Subject: subject, HTMLPart: html }] }),
        });
        const d = await r.json();
        if (!r.ok) return res.status(400).json({ error: d.ErrorMessage || JSON.stringify(d) });
        return res.status(200).json({ success: true });
      }

      case 'smtp': {
        const nodemailer = require('nodemailer');
        const { smtp_host, smtp_port, smtp_username, smtp_password } = provider;
        if (!smtp_host || !smtp_username || !smtp_password) return res.status(500).json({ error: 'SMTP: host, användarnamn och lösenord krävs' });
        const t = nodemailer.createTransporter({ host: smtp_host, port: parseInt(smtp_port) || 587, secure: parseInt(smtp_port) === 465, auth: { user: smtp_username, pass: smtp_password } });
        await t.sendMail({ from: sender.from, to, subject, html });
        return res.status(200).json({ success: true });
      }

      default: {
        const key = process.env.RESEND_API_KEY;
        if (key) {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: 'Nisha Goriel Photography <onboarding@resend.dev>', to: [to], subject, html }),
          });
          const d = await r.json();
          if (!r.ok) return res.status(400).json({ error: d.message || JSON.stringify(d) });
          return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Ingen e-postleverantör konfigurerad. Gå till Inställningar → E-postleverantör och välj Resend.' });
      }
    }
  } catch (err) {
    console.error('test-email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
