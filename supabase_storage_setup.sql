-- ============================================================
-- SUPABASE STORAGE SETUP FOR GALLERY
-- ============================================================
-- OBS: Bucket skapas INTE via SQL – det görs i Dashboard.
-- Kör denna SQL EFTER att du har skapat bucketen manuellt.
-- ============================================================

-- STEG 1: Gå till Supabase Dashboard → Storage
--   Klicka "New bucket"
--   Name: gallery
--   Public: JA (sätt toggle till ON)
--   Klicka "Save"

-- STEG 2: Kör SQL nedan i Dashboard → SQL Editor

-- ── Storage RLS-policies för gallery-bucketen ──────────────

-- Tillåt alla att läsa filer (public bucket)
CREATE POLICY "Public read gallery images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery' );

-- Tillåt inloggade admins att ladda upp
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'gallery' );

-- Tillåt inloggade admins att ta bort filer
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'gallery' );

-- Tillåt inloggade admins att uppdatera filer (upsert vid import)
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'gallery' );

-- ============================================================
-- STEG 3: Verifiera att bucketen är PUBLIC
-- Dashboard → Storage → gallery → Settings → Public = ON
-- ============================================================

-- ── Fix för settings-tabellen (om du får RLS-fel vid sparning) ──

-- Om save-settings via service role inte fungerar, kör detta:
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Service role bypass (Vercel-funktioner använder service role key,
-- som automatiskt kringgår RLS – ingen extra policy behövs för det).

-- ============================================================
-- EXTRA: Kontrollera att contact_messages tillåter anonym INSERT
-- (för kontaktformuläret utan inloggning)
-- ============================================================
DROP POLICY IF EXISTS "Public can submit contact messages" ON contact_messages;

CREATE POLICY "Public can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);
