-- Supabase Database Schema for Nisha Goriel Photography
-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (admin users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    title VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'wedding',
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery("order");

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),
    video_url TEXT,
    description TEXT,
    thumbnail_url TEXT,
    embed_url TEXT,
    display_type VARCHAR(20) DEFAULT 'embed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    booking_date VARCHAR(50),
    venue VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);

-- Visitor analytics table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    page_visited VARCHAR(255) NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    visit_start TIMESTAMPTZ DEFAULT NOW(),
    visit_end TIMESTAMPTZ,
    duration_seconds INTEGER
);

CREATE INDEX IF NOT EXISTS idx_visitors_visit_start ON visitors(visit_start DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page_visited ON visitors(page_visited);

-- Site settings table (single row)
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'site_settings',
    logo_url TEXT,
    contact_image_url TEXT,
    contact_image_opacity INTEGER DEFAULT 30,
    favicon_url TEXT,
    seo JSONB,
    mailtrap_api_key TEXT,
    recipient_email VARCHAR(255) DEFAULT 'info@nishagoriel.com',
    contact_info JSONB,
    button_labels JSONB,
    categories JSONB,
    site_texts JSONB,
    typography JSONB,
    email_provider JSONB,
    animation_settings JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO settings (id, recipient_email)
VALUES ('site_settings', 'info@nishagoriel.com')
ON CONFLICT (id) DO NOTHING;

-- Migration: add contact_image_opacity if upgrading from older schema
ALTER TABLE settings ADD COLUMN IF NOT EXISTS contact_image_opacity INTEGER DEFAULT 30;
-- Migration: add favicon and SEO columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS seo JSONB;

-- Note: Default admin user should be created in Supabase Auth Dashboard
-- Email: info@nishagoriel.com

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 1. Users Table (Admin only)
CREATE POLICY "Admins can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- 2. Gallery Table
CREATE POLICY "Public can view gallery" ON gallery
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON gallery
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Videos Table
CREATE POLICY "Public can view videos" ON videos
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON videos
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Contact Messages Table
CREATE POLICY "Public can submit contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON contact_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. Visitors Table
CREATE POLICY "Public can log visits" ON visitors
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON visitors
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Settings Table
CREATE POLICY "Public can view public settings" ON settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- STORAGE SETUP (Run in Dashboard)
-- ==========================================
-- 1. Create a bucket named 'gallery'
-- 2. Set it to 'Public'
-- 3. Add policy: "Allow public read access"
-- 4. Add policy: "Allow authenticated uploads/deletes"
