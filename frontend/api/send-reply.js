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

// Luxury reply email — dual light/dark via prefers-color-scheme media query
const buildReplyHtml = (name, originalMessage, replyText, senderName) => `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Svar från ${senderName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

  /* ── Light mode (default) ── */
  :root {
    --bg:          #faf9f7;
    --card-bg:     #ffffff;
    --border:      #e8e0d5;
    --gold:        #b8935a;
    --gold-light:  #d4a96a;
    --gold-grad:   linear-gradient(90deg, #c9a96e, #e8d5b0, #c9a96e);
    --text-h:      #1a1a1a;
    --text-body:   #3d3530;
    --text-muted:  #8a7d72;
    --text-faint:  #b8ac9f;
    --reply-bg:    #fdf6ee;
    --reply-border:#c9a96e;
    --orig-bg:     #f5f2ef;
    --orig-border: #ddd5c8;
    --btn-bg:      linear-gradient(135deg, #c9a96e, #b8935a);
    --btn-text:    #ffffff;
    --footer-bg:   #f5f2ef;
    --footer-text: #a09488;
    --divider:     #e8e0d5;
  }

  /* ── Dark mode ── */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:          #0a0a0a;
      --card-bg:     #111111;
      --border:      #2a2a2a;
      --gold:        #c9a96e;
      --gold-light:  #e8d5b0;
      --gold-grad:   linear-gradient(90deg, #c9a96e, #e8d5b0, #c9a96e);
      --text-h:      #f5f0e8;
      --text-body:   #c8bfaf;
      --text-muted:  #8a8078;
      --text-faint:  #4a4540;
      --reply-bg:    #161616;
      --reply-border:#c9a96e;
      --orig-bg:     #0d0d0d;
      --orig-border: #2a2a2a;
      --btn-bg:      linear-gradient(135deg, #c9a96e, #b8935a);
      --btn-text:    #0a0a0a;
      --footer-bg:   #0d0d0d;
      --footer-text: #444;
      --divider:     #2a2a2a;
    }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Montserrat', Arial, sans-serif;
    background-color: var(--bg);
    color: var(--text-body);
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    background-color: var(--bg);
    padding: 48px 20px;
  }
  .card {
    max-width: 600px;
    margin: 0 auto;
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .gold-bar {
    height: 3px;
    background: var(--gold-grad);
  }
  .header {
    padding: 48px 48px 32px;
    text-align: center;
    border-bottom: 1px solid var(--divider);
  }
  .header-eyebrow {
    font-size: 10px;
    letter-spacing: 0.45em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .header-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 44px;
    font-weight: 300;
    color: var(--text-h);
    letter-spacing: 0.07em;
    line-height: 1;
  }
  .header-sub {
    font-size: 9px;
    letter-spacing: 0.4em;
    color: var(--text-faint);
    text-transform: uppercase;
    margin-top: 10px;
    font-weight: 400;
  }
  .body {
    padding: 40px 48px;
  }
  .greeting {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px;
    font-weight: 400;
    font-style: italic;
    color: var(--text-h);
    margin-bottom: 28px;
  }
  .reply-block {
    background-color: var(--reply-bg);
    border-left: 3px solid var(--reply-border);
    border-radius: 0 4px 4px 0;
    padding: 28px 32px;
    margin-bottom: 32px;
  }
  .reply-label {
    font-size: 9px;
    letter-spacing: 0.35em;
    color: var(--gold);
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 14px;
  }
  .reply-text {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 17px;
    font-weight: 300;
    line-height: 1.85;
    color: var(--text-body);
    white-space: pre-wrap;
  }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, var(--gold), transparent);
    margin: 0 0 32px 0;
    opacity: 0.4;
  }
  .original-label {
    font-size: 9px;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .original-block {
    background-color: var(--orig-bg);
    border: 1px solid var(--orig-border);
    border-radius: 4px;
    padding: 20px 24px;
    margin-bottom: 40px;
  }
  .original-text {
    font-size: 13px;
    line-height: 1.75;
    color: var(--text-muted);
    white-space: pre-wrap;
    font-style: italic;
  }
  .btn-wrap {
    text-align: center;
    margin-bottom: 16px;
  }
  .signature {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 18px;
    font-weight: 300;
    font-style: italic;
    color: var(--text-muted);
    margin-top: 8px;
  }
  .footer {
    background-color: var(--footer-bg);
    border-top: 1px solid var(--divider);
    padding: 24px 48px;
    text-align: center;
  }
  .footer p {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--footer-text);
    text-transform: uppercase;
    line-height: 1.8;
  }
  .footer-gold {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 300;
    font-style: italic;
    color: var(--text-faint);
    margin-top: 8px;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .header, .body, .footer { padding-left: 28px; padding-right: 28px; }
    .header-name { font-size: 34px; }
    .reply-block { padding: 20px 20px; }
  }
</style>
</head>
<body>
<div class="wrapper">
<div class="card">

  <div class="gold-bar"></div>

  <!-- Header -->
  <div class="header">
    <p class="header-eyebrow">Photography</p>
    <h1 class="header-name">Nisha Goriel</h1>
    <p class="header-sub">Personal Reply</p>
  </div>

  <!-- Body -->
  <div class="body">

    <p class="greeting">Dear ${name},</p>

    <!-- Reply block -->
    <div class="reply-block">
      <p class="reply-label">Message from ${senderName}</p>
      <p class="reply-text">${replyText}</p>
    </div>

    ${originalMessage ? `
    <div class="divider"></div>
    <p class="original-label">Your original message</p>
    <div class="original-block">
      <p class="original-text">${originalMessage}</p>
    </div>
    ` : ''}

    <p class="signature">— ${senderName}</p>

  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Nisha Goriel Photography &nbsp;·&nbsp; nishagoriel.com</p>
    <div class="footer-gold">NG</div>
  </div>

  <div class="gold-bar"></div>

</div>
</div>
</body>
</html>`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, name, originalMessage, replyText } = req.body;
  if (!to || !replyText) return res.status(400).json({ error: 'Missing required fields: to, replyText' });

  let settings = null;
  try {
    const { data, error } = await supabase
      .from('settings').select('email_provider').eq('id', 'site_settings').single();
    if (error) console.error('Settings fetch error:', error);
    else settings = data;
  } catch (e) { console.error('Supabase error:', e); }

  const provider    = settings?.email_provider || {};
  const sender      = getSafeSender(provider);
  const subject     = `Re: Din förfrågan – ${sender.name}`;
  const html        = buildReplyHtml(
    name || 'there',
    originalMessage || '',
    replyText,
    sender.name
  );

  console.log('send-reply:', { provider: provider.provider, from: sender.from, to });

  try {
    switch (provider.provider) {

      case 'resend': {
        const key = provider.api_key || process.env.RESEND_API_KEY;
        if (!key) return res.status(500).json({ error: 'Resend: API-nyckel saknas' });
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: sender.from, to: [to], subject, html }),
        });
        const d = await r.json();
        if (!r.ok) { console.error('Resend reply error:', d); return res.status(400).json({ error: d.message || JSON.stringify(d) }); }
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
        return res.status(500).json({ error: 'Ingen e-postleverantör konfigurerad.' });
      }
    }
  } catch (err) {
    console.error('send-reply error:', err);
    return res.status(500).json({ error: err.message });
  }
}
