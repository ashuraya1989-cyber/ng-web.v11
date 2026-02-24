import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

// Safe sender: never send from example.com or empty — always fall back to onboarding@resend.dev
function getSafeSender(provider) {
  const name  = provider.sender_name  || 'Nisha Goriel Photography';
  const email = provider.sender_email || '';
  const badDomains = ['example.com', 'example.org', 'test.com', 'localhost', ''];
  const domain = email.split('@')[1] || '';
  const finalEmail = email && !badDomains.includes(domain) ? email : 'onboarding@resend.dev';
  return { name, email: finalEmail, from: `${name} <${finalEmail}>` };
}

const buildEmailHtml = (f) => {
  // Force all backgrounds to pure dark — no media queries, all inline
  const bg     = '#080808';
  const card   = '#111111';
  const border = '#1c1c1c';
  const gold   = '#c9a96e';
  const text   = '#e8e0d0';
  const muted  = '#888888';
  const label  = '#3a3a3a';

  const row = (lbl, val, isLink = null) => !val ? '' : `
    <tr><td style="padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid ${border};">
            <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${label};font-weight:600;">${lbl}</p>
            ${isLink
              ? `<a href="${isLink}" style="margin:0;font-size:15px;color:${gold};text-decoration:none;display:block;word-break:break-all;">${val}</a>`
              : `<p style="margin:0;font-size:15px;color:${text};word-break:break-word;">${val}</p>`
            }
          </td>
        </tr>
      </table>
    </td></tr>`;

  return `<!DOCTYPE html>
<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<!--[if !mso]><!-->
<meta name="color-scheme" content="only dark"/>
<meta name="supported-color-schemes" content="only dark"/>
<!--<![endif]-->
<title>Ny förfrågan – Nisha Goriel Photography</title>
<!--[if mso]>
<style type="text/css">
body,table,td,a{font-family:Arial,sans-serif !important;}
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;color:${bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  Ny förfrågan från ${f.name} – Nisha Goriel Photography
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${bg};min-width:100%;">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

    <!-- Gold top bar -->
    <tr><td style="height:2px;background:linear-gradient(90deg,${bg},${gold},#e8d5b0,${gold},${bg});border-radius:2px 2px 0 0;font-size:0;">&nbsp;</td></tr>

    <!-- CARD -->
    <tr><td style="background-color:${card};border-radius:0 0 16px 16px;overflow:hidden;">

      <!-- Studio header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:28px 32px 24px;text-align:center;border-bottom:1px solid ${border};background-color:${card};">
          <p style="margin:0 0 8px;font-size:8px;letter-spacing:0.5em;text-transform:uppercase;color:${gold};font-weight:700;">Photography Studio</p>
          <p style="margin:0;font-size:28px;font-weight:300;color:#f0ebe3;letter-spacing:0.08em;font-family:Georgia,'Times New Roman',serif;line-height:1.1;">Nisha Goriel</p>
          <p style="margin:10px 0 0;font-size:8px;letter-spacing:0.35em;text-transform:uppercase;color:${label};">Ny kundförfrågan</p>
        </td></tr>
      </table>

      <!-- Fields: one row per field -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${card};">
        ${row('Namn', f.name)}
        ${row('Email', f.email, `mailto:${f.email}`)}
        ${row('Telefon', f.phone, f.phone ? `tel:${f.phone}` : null)}
        ${row('Önskat datum', f.booking_date)}
        ${row('Plats / Venue', f.venue)}
      </table>

      <!-- Gold accent divider -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 32px 0;">
          <div style="height:1px;background:linear-gradient(to right,${gold},rgba(201,169,110,0.1));">&nbsp;</div>
        </td></tr>
      </table>

      <!-- Message label -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 32px 8px;background-color:${card};">
          <p style="margin:0;font-size:8px;letter-spacing:0.38em;text-transform:uppercase;color:${gold};font-weight:700;">Meddelande</p>
        </td></tr>
      </table>

      <!-- Message bubble -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:0 32px 28px;background-color:${card};">
          <div style="background:#161616;border-left:3px solid ${gold};border-radius:0 10px 10px 0;padding:18px 20px;">
            <p style="margin:0;font-size:15px;line-height:1.8;color:#c4bba8;white-space:pre-wrap;word-break:break-word;">${f.message || '(inget meddelande)'}</p>
          </div>
        </td></tr>
      </table>

      <!-- Reply CTA -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:0 32px 32px;background-color:${card};" align="left">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-radius:10px;background:linear-gradient(135deg,#c9a96e,#b8935a);">
                <a href="mailto:${f.email}?subject=Re%3A%20Din%20f%C3%B6rfr%C3%A5gan%20%E2%80%93%20Nisha%20Goriel%20Photography"
                   style="display:inline-block;padding:13px 28px;color:#000000;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;white-space:nowrap;font-family:Arial,sans-serif;">
                  Svara ${f.name ? f.name.split(' ')[0] : ''} &#8594;
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 32px;background-color:#0c0c0c;border-top:1px solid #1a1a1a;border-radius:0 0 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><p style="margin:0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#2e2e2e;">Nisha Goriel Photography &nbsp;&middot;&nbsp; nishagoriel.com</p></td>
              <td align="right"><p style="margin:0;font-size:20px;font-weight:300;font-style:italic;color:#222222;font-family:Georgia,serif;">NG</p></td>
            </tr>
          </table>
        </td></tr>
      </table>

    </td></tr>
    <!-- Gold bottom bar -->
    <tr><td style="height:2px;background:linear-gradient(90deg,${bg},${gold},#e8d5b0,${gold},${bg});border-radius:0 0 2px 2px;font-size:0;">&nbsp;</td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, booking_date, venue, message, turnstile_token } = req.body;

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstile_token) return res.status(403).json({ error: 'Missing security token.' });
    const vRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstile_token }),
    });
    if (!(await vRes.json()).success) return res.status(403).json({ error: 'Security verification failed.' });
  }

  const safe = {
    name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone),
    booking_date: escapeHtml(booking_date), venue: escapeHtml(venue), message: escapeHtml(message),
  };

  let settings = null;
  try {
    const { data, error } = await supabase
      .from('settings').select('email_provider, recipient_email').eq('id', 'site_settings').single();
    if (error) console.error('Settings fetch error:', error);
    else settings = data;
  } catch (e) { console.error('Supabase error:', e); }

  const provider  = settings?.email_provider || {};
  const recipient = settings?.recipient_email || process.env.RECIPIENT_EMAIL || 'info@nishagoriel.com';
  const sender    = getSafeSender(provider);
  const subject   = `✦ New Inquiry from ${safe.name}`;
  const html      = buildEmailHtml(safe);
  // reply_to = the customer's email so Nisha can reply directly from her mail client
  const customerEmail = safe.email;
  const customerReplyTo = `${safe.name} <${customerEmail}>`;

  console.log('send-email:', { provider: provider.provider, from: sender.from, to: recipient, reply_to: customerEmail });

  try {
    switch (provider.provider) {

      case 'resend': {
        const key = provider.api_key || process.env.RESEND_API_KEY;
        if (!key) return res.status(500).json({ error: 'Resend: API-nyckel saknas. Lägg till den under Inställningar → E-postleverantör.' });
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: sender.from, to: [recipient], reply_to: customerEmail, subject, html }),
        });
        const d = await r.json();
        if (!r.ok) { console.error('Resend error:', d); return res.status(400).json({ error: d.message || JSON.stringify(d) }); }
        return res.status(200).json({ success: true });
      }

      case 'mailtrap': {
        const key = provider.api_key;
        if (!key) return res.status(500).json({ error: 'Mailtrap: API-nyckel saknas' });
        const r = await fetch('https://send.api.mailtrap.io/api/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: { name: sender.name, email: sender.email }, to: [{ email: recipient }], reply_to: [{ email: customerEmail }], subject, html }),
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
          body: JSON.stringify({ personalizations: [{ to: [{ email: recipient }] }], from: { name: sender.name, email: sender.email }, reply_to: { email: customerEmail, name: safe.name }, subject, content: [{ type: 'text/html', value: html }] }),
        });
        if (!r.ok) { const d = await r.json(); return res.status(400).json({ error: d.errors?.[0]?.message || JSON.stringify(d) }); }
        return res.status(200).json({ success: true });
      }

      case 'mailgun': {
        const key = provider.api_key; const domain = provider.domain;
        if (!key || !domain) return res.status(500).json({ error: 'Mailgun: API-nyckel och domän krävs' });
        const form = new URLSearchParams();
        form.append('from', sender.from); form.append('to', recipient);
        form.append('h:Reply-To', customerReplyTo);
        form.append('subject', subject); form.append('html', html);
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
          body: JSON.stringify({ sender: { name: sender.name, email: sender.email }, to: [{ email: recipient }], replyTo: { email: customerEmail, name: safe.name }, subject, htmlContent: html }),
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
          body: JSON.stringify({ Messages: [{ From: { Email: sender.email, Name: sender.name }, To: [{ Email: recipient }], ReplyTo: { Email: customerEmail, Name: safe.name }, Subject: subject, HTMLPart: html }] }),
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
        await t.sendMail({ from: sender.from, to: recipient, replyTo: customerReplyTo, subject, html });
        return res.status(200).json({ success: true });
      }

      default: {
        const key = process.env.RESEND_API_KEY;
        if (key) {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: 'Nisha Goriel Photography <onboarding@resend.dev>', to: [recipient], reply_to: customerEmail, subject, html }),
          });
          const d = await r.json();
          if (!r.ok) return res.status(400).json({ error: d.message || JSON.stringify(d) });
          return res.status(200).json({ success: true });
        }
        return res.status(200).json({ success: true, warning: 'No email provider configured – message saved to database only' });
      }
    }
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
