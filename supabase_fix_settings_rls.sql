-- Kör detta i Supabase SQL Editor för att fixa sparning av inställningar

-- Ta bort gamla policies
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

-- Skapa nya policies
CREATE POLICY "Public can view public settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (true);
