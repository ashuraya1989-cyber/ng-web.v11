-- ============================================================
-- ng-web.v11 – KOMPLETT & FIXAT DATABASSCHEMA
-- Kör HELA denna fil i Supabase → SQL Editor → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── GALLERY ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    url          TEXT         NOT NULL,
    title        VARCHAR(255),
    category     VARCHAR(50)  NOT NULL DEFAULT 'wedding',
    "order"      INTEGER      DEFAULT 0,
    created_at   TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_order    ON gallery("order");

-- ── VIDEOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
    id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title          VARCHAR(255) NOT NULL,
    vimeo_id       VARCHAR(50),
    video_url      TEXT,
    description    TEXT,
    thumbnail_url  TEXT,
    embed_url      TEXT,
    display_type   VARCHAR(20)  DEFAULT 'embed',
    created_at     TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ── CONTACT MESSAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(50),
    booking_date  VARCHAR(50),
    venue         VARCHAR(255),
    message       TEXT         NOT NULL,
    is_read       BOOLEAN      DEFAULT FALSE,
    ip_address    VARCHAR(45),
    country       VARCHAR(100),
    city          VARCHAR(100),
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read    ON contact_messages(is_read);

-- ── VISITORS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address       VARCHAR(45),
    country          VARCHAR(100),
    city             VARCHAR(100),
    region           VARCHAR(100),
    page_visited     VARCHAR(255) NOT NULL,
    user_agent       TEXT,
    referrer         TEXT,
    visit_start      TIMESTAMPTZ  DEFAULT NOW(),
    visit_end        TIMESTAMPTZ,
    duration_seconds INTEGER
);
CREATE INDEX IF NOT EXISTS idx_visitors_visit_start   ON visitors(visit_start DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_visited  ON visitors(page_visited);

-- ── SETTINGS ─────────────────────────────────────────────────
-- OBS: email_provider JSONB är kritisk för att Resend/e-post ska fungera!
CREATE TABLE IF NOT EXISTS settings (
    id                 VARCHAR(50)  PRIMARY KEY DEFAULT 'site_settings',
    logo_url           TEXT,
    contact_image_url  TEXT,
    recipient_email    VARCHAR(255) DEFAULT 'info@nishagoriel.com',
    contact_info       JSONB        DEFAULT '{"location":"Stockholm, Sweden","phone":"+46 70 123 4567","email":"info@nishagoriel.com","hours":"Mon - Fri: 9:00 - 18:00"}',
    button_labels      JSONB        DEFAULT '{"view_gallery":"View Gallery","book_session":"Book a Session","book_now":"Book Now","get_in_touch":"Get in Touch","send_message":"Skicka meddelande"}',
    categories         JSONB        DEFAULT '[{"id":"wedding","name":"Wedding","slug":"wedding"},{"id":"pre-wedding","name":"Pre-Wedding","slug":"pre-wedding"}]',
    site_texts         JSONB        DEFAULT '{"hero_tagline":{"text":"Wedding & Pre-Wedding Photography","font":"Space Grotesk","color":"rgba(255,255,255,0.8)","size":"text-sm"},"hero_title":{"text":"Nisha Goriel","font":"Cormorant Garamond","color":"#ffffff","size":"text-7xl"},"hero_subtitle":{"text":"Photography","font":"Cormorant Garamond","color":"rgba(255,255,255,0.9)","size":"text-7xl"}}',
    typography         JSONB        DEFAULT '{"heading_font":"Cormorant Garamond","body_font":"Space Grotesk","custom_fonts":[]}',
    animation_settings JSONB        DEFAULT '{"hero_animation":"fade","gallery_animation":"fade","page_transition":"fade","animation_speed":"normal"}',

    -- ✅ KRITISK KOLUMN – saknades tidigare – krävs för Resend/e-post
    email_provider     JSONB        DEFAULT '{"provider":"none","api_key":"","api_secret":"","domain":"","smtp_host":"","smtp_port":587,"smtp_username":"","smtp_password":"","sender_email":"noreply@example.com","sender_name":"Nisha Goriel Photography"}',

    updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

-- Lägg till email_provider om tabellen redan existerar men kolumnen saknas
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email_provider JSONB DEFAULT '{"provider":"none","api_key":"","api_secret":"","domain":"","smtp_host":"","smtp_port":587,"smtp_username":"","smtp_password":"","sender_email":"noreply@example.com","sender_name":"Nisha Goriel Photography"}';

-- Grundrad – skapas om den inte finns
INSERT INTO settings (id, recipient_email)
VALUES ('site_settings', 'info@nishagoriel.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE gallery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings         ENABLE ROW LEVEL SECURITY;

-- ── Gallery ──
DROP POLICY IF EXISTS "Public can view gallery"  ON gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery;
CREATE POLICY "Public can view gallery"   ON gallery FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON gallery FOR ALL    USING (auth.role() = 'authenticated');

-- ── Videos ──
DROP POLICY IF EXISTS "Public can view videos"  ON videos;
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Public can view videos"   ON videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON videos FOR ALL    USING (auth.role() = 'authenticated');

-- ── Contact Messages ──
DROP POLICY IF EXISTS "Public can submit contact messages"   ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact messages"   ON contact_messages;
CREATE POLICY "Public can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- ── Visitors ──
DROP POLICY IF EXISTS "Public can log visits"    ON visitors;
DROP POLICY IF EXISTS "Admins can view analytics" ON visitors;
DROP POLICY IF EXISTS "Admins can update visits"  ON visitors;
CREATE POLICY "Public can log visits"     ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update visits"  ON visitors FOR UPDATE USING (true);

-- ── Settings ──
-- USING (true) = alla kan läsa + skriva via service role key (Vercel functions)
-- Service role key kringgår RLS automatiskt – detta är säkert.
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings"      ON settings;
CREATE POLICY "Public can view public settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings"      ON settings FOR ALL    USING (true);

-- ============================================================
-- STORAGE – KAN EJ SKAPAS VIA SQL, GÖRS I DASHBOARD
-- ============================================================
-- Gör detta manuellt i Supabase Dashboard → Storage:
--
--   1. Klicka "New bucket"
--   2. Name: gallery
--   3. Public: ON  ← viktigt!
--   4. Klicka Save
--
-- Kör sedan dessa Storage-policies:

DROP POLICY IF EXISTS "Public read gallery images"                    ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images"  ON storage.objects;

CREATE POLICY "Public read gallery images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'gallery' );

CREATE POLICY "Authenticated users can upload gallery images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'gallery' );

CREATE POLICY "Authenticated users can delete gallery images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'gallery' );

CREATE POLICY "Authenticated users can update gallery images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id = 'gallery' );

-- ============================================================
-- VERIFIERA EFTER KÖRNING:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'settings'
--   ORDER BY column_name;
--
-- Du ska se: email_provider, animation_settings, categories,
-- button_labels, contact_info, site_texts, typography, etc.
-- ============================================================
