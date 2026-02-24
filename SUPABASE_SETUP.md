# Supabase Setup Guide

Denna guide visar hur du konfigurerar Supabase för Nisha Goriel Photography-webbplatsen.

## 📋 Steg 1: Skapa Supabase Projekt

1. Gå till [supabase.com](https://supabase.com) och logga in
2. Klicka "New Project"
3. Fyll i:
   - **Name**: `nishagoriel-photography` (eller valfritt namn)
   - **Database Password**: Välj ett starkt lösenord (spara detta!)
   - **Region**: Välj närmaste region
4. Klicka "Create new project"
5. Vänta tills projektet är klart (tar 1-2 minuter)

## 🗄️ Steg 2: Skapa Databastabeller

1. I Supabase Dashboard, gå till **SQL Editor** (vänstermenyn)
2. Klicka "New Query"
3. Öppna filen `backend/supabase_schema.sql` i din editor
4. Kopiera hela innehållet och klistra in i SQL Editor
5. Klicka "Run" (eller tryck Ctrl+Enter)
6. Kontrollera att alla tabeller skapades utan fel

## 🔑 Steg 3: Hämta Connection String

1. I Supabase Dashboard, gå till **Project Settings** (kugghjulet längst ner till vänster)
2. Klicka på **Database** i vänstermenyn
3. Scrolla ner till **Connection String**
4. Välj **URI** tab
5. Kopiera connection string (ser ut som: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`)
6. Ersätt `[YOUR-PASSWORD]` med ditt databaslösenord som du skapade i Steg 1

## ⚙️ Steg 4: Konfigurera Backend

1. I `backend/` mappen, kopiera `.env.example` till `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Öppna `backend/.env` och uppdatera:
   ```env
   SUPABASE_DB_URL=postgresql://postgres:DITT_LÖSENORD@ditt-projekt-ref.supabase.co:5432/postgres
   JWT_SECRET=ditt-säkra-jwt-secret-nyckel
   ```

3. Generera en säker JWT_SECRET:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

## ✅ Steg 5: Testa Anslutningen

1. Installera backend dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Starta backend:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Kontrollera att servern startar utan fel
4. Backend kommer automatiskt skapa default admin användare:
   - **Email**: `info@nishagoriel.com`
   - **Password**: `admin123`
   - ⚠️ **VIKTIGT**: Byt lösenord direkt efter första inloggningen!

## 🚀 Steg 6: Deploya Backend

För produktion, deploya backend på:
- **Railway**: [railway.app](https://railway.app) (rekommenderat)
- **Render**: [render.com](https://render.com)
- **Fly.io**: [fly.io](https://fly.io)

Se [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) för detaljerad deployment-guide.

## 📝 Ytterligare Konfiguration

### Row Level Security (RLS)

Supabase har Row Level Security aktiverat som standard. För denna applikation behöver vi inaktivera RLS eftersom vi hanterar autentisering i backend:

1. I SQL Editor, kör:
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
   ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
   ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
   ALTER TABLE visitors DISABLE ROW LEVEL SECURITY;
   ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
   ```

   **OBS**: Detta är säkert eftersom backend hanterar all autentisering via JWT tokens.

### Backup

Supabase har automatiska backups, men du kan också skapa manuella backups:
1. Gå till **Database** → **Backups**
2. Klicka "Create Backup"

## 🔍 Troubleshooting

### Connection Error
- Kontrollera att connection string är korrekt
- Kontrollera att lösenordet är rätt (inga extra mellanslag)
- Kontrollera att projektet är aktivt i Supabase Dashboard

### Table Already Exists Error
- Om tabeller redan finns, använd `DROP TABLE` för att ta bort dem först (endast i development!)
- Eller ändra `CREATE TABLE` till `CREATE TABLE IF NOT EXISTS` i schema-filen

### UUID Extension Error
- Kör manuellt: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` i SQL Editor

## 📚 Ytterligare Resurser

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [asyncpg Documentation](https://magicstack.github.io/asyncpg/)
