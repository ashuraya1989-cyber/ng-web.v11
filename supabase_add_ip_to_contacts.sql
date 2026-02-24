-- Add IP and geo columns to contact_messages (run this in Supabase SQL Editor)
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
  ADD COLUMN IF NOT EXISTS country    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city       VARCHAR(100);
