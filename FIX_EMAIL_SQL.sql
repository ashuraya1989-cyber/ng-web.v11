-- ============================================================
-- KÖR DETTA I SUPABASE → SQL EDITOR
-- Fixar sender_email i din befintliga settings-rad
-- från "noreply@example.com" till "onboarding@resend.dev"
-- ============================================================

-- Steg 1: Se vad som finns i databasen nu
SELECT 
  id,
  recipient_email,
  email_provider->>'provider'     AS provider,
  email_provider->>'api_key'      AS api_key_set,
  email_provider->>'sender_email' AS sender_email,
  email_provider->>'sender_name'  AS sender_name
FROM settings 
WHERE id = 'site_settings';

-- Steg 2: Uppdatera sender_email till onboarding@resend.dev
-- (detta är Resends delade domän som fungerar utan domänverifiering)
UPDATE settings
SET email_provider = email_provider || '{"sender_email": "onboarding@resend.dev"}'::jsonb
WHERE id = 'site_settings'
  AND (
    email_provider->>'sender_email' IS NULL OR
    email_provider->>'sender_email' = '' OR
    email_provider->>'sender_email' LIKE '%example.com%'
  );

-- Steg 3: Verifiera att det är rätt nu
SELECT 
  email_provider->>'provider'     AS provider,
  email_provider->>'sender_email' AS sender_email,
  email_provider->>'sender_name'  AS sender_name,
  recipient_email
FROM settings 
WHERE id = 'site_settings';

-- ============================================================
-- VIKTIG PÅMINNELSE OM RESEND:
-- 
-- Med onboarding@resend.dev som avsändare KAN du bara skicka
-- till den e-post du registrerade på resend.com.
--
-- recipient_email i settings = den e-post som tar emot 
-- kontaktformulär. Sätt den till din Resend-registrerade e-post.
--
-- Exempel: Om du registrerade dig på resend.com med gmail@gmail.com
-- → sätt recipient_email = 'gmail@gmail.com'
-- → sätt sender_email    = 'onboarding@resend.dev'
-- → testmail till gmail@gmail.com fungerar direkt
-- ============================================================
