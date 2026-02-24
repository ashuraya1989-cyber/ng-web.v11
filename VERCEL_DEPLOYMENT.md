# Vercel Deployment Guide

Denna guide visar hur du deployar Nishagoriel Photography-webbplatsen på Vercel.

## 📋 Förutsättningar

- Ett GitHub-konto
- Ett Vercel-konto (gratis på [vercel.com](https://vercel.com))
- Ett Supabase-konto (gratis på [supabase.com](https://supabase.com))
- Backend deployad på en separat plattform (Railway, Render, Fly.io, etc.)

## 🚀 Steg 1: Förbered GitHub Repository

1. **Skapa nytt repository på GitHub:**
   ```bash
   git remote remove origin  # Om du har en befintlig remote
   git remote add origin https://github.com/DITT_ANVÄNDARNAMN/Nishagoriel_page_v10.git
   git branch -M main
   git push -u origin main
   ```

2. **Eller skapa repository via GitHub web interface:**
   - Gå till [github.com/new](https://github.com/new)
   - Repository namn: `Nishagoriel_page_v10`
   - Välj Public eller Private
   - Klicka "Create repository"
   - Följ instruktionerna för att pusha din kod

## 🚀 Steg 1: Supabase Setup (Först!)

1. Skapa ett Supabase projekt på [supabase.com](https://supabase.com)
2. Kör SQL-schemat: Öppna `backend/supabase_schema.sql` i Supabase SQL Editor och kör det
3. Hämta connection string från Supabase Dashboard → Project Settings → Database

Se [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) för detaljerade instruktioner.

## 🚀 Steg 2: Deploya Backend

Backend måste deployas först eftersom frontend behöver backend-URL:en.

### Alternativ A: Railway (Rekommenderat)

1. Gå till [railway.app](https://railway.app) och logga in med GitHub
2. Klicka "New Project" → "Deploy from GitHub repo"
3. Välj ditt repository
4. Välj backend-mappen eller skapa en ny service
5. Lägg till miljövariabler:
   - `SUPABASE_DB_URL`: Din Supabase PostgreSQL connection string
   - `JWT_SECRET`: Generera med `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `CORS_ORIGINS`: Din Vercel-URL (t.ex. `https://nishagoriel-page-v10.vercel.app`)
6. Railway kommer automatiskt deploya när du pushar till GitHub
7. Kopiera backend-URL:en (t.ex. `https://your-app.railway.app`)

### Alternativ B: Render

1. Gå till [render.com](https://render.com) och logga in
2. Klicka "New" → "Web Service"
3. Anslut ditt GitHub repository
4. Konfigurera:
   - **Name**: `nishagoriel-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Lägg till miljövariabler:
   - `SUPABASE_DB_URL`: Din Supabase connection string
   - `JWT_SECRET`: Generera säker nyckel
   - `CORS_ORIGINS`: Din Vercel-URL
6. Kopiera backend-URL:en

### Alternativ C: Fly.io

1. Installera Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Logga in: `fly auth login`
3. Skapa app: `fly launch` i backend-mappen
4. Lägg till miljövariabler: `fly secrets set SUPABASE_DB_URL=... JWT_SECRET=... CORS_ORIGINS=...`
5. Deploya: `fly deploy`
6. Kopiera backend-URL:en

## 🚀 Steg 3: Deploya Frontend på Vercel

1. **Logga in på Vercel:**
   - Gå till [vercel.com](https://vercel.com)
   - Logga in med ditt GitHub-konto

2. **Importera projekt:**
   - Klicka "Add New..." → "Project"
   - Välj ditt GitHub repository `Nishagoriel_page_v10`
   - Vercel kommer automatiskt detektera att det är ett React-projekt

3. **Konfigurera projekt:**
   - **Framework Preset**: Välj "Other" eller låt Vercel auto-detektera
   - **Root Directory**: Lämna tom (eller sätt till `frontend` om Vercel inte hittar det)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

4. **Lägg till miljövariabler:**
   - Klicka på "Environment Variables"
   - Lägg till:
     - `REACT_APP_BACKEND_URL`: Din backend-URL (t.ex. `https://your-app.railway.app`)
     - Om du använder Cloudflare Turnstile:
       - `REACT_APP_TURNSTILE_SITE_KEY`: Din Turnstile site key

5. **Deploya:**
   - Klicka "Deploy"
   - Vercel kommer automatiskt deploya och ge dig en URL (t.ex. `https://nishagoriel-page-v10.vercel.app`)

## 🔄 Steg 4: Uppdatera CORS i Backend

Efter att frontend är deployad, uppdatera backend CORS-inställningar:

1. Gå till din backend-plattform (Railway/Render/Fly.io)
2. Uppdatera miljövariabeln `CORS_ORIGINS`:
   ```
   https://nishagoriel-page-v10.vercel.app,https://www.nishagoriel-page-v10.vercel.app
   ```
3. Starta om backend-tjänsten

## 🌐 Steg 5: Anpassad domän (Valfritt)

1. I Vercel-projektet, gå till "Settings" → "Domains"
2. Lägg till din domän (t.ex. `nishagoriel.com`)
3. Följ instruktionerna för att konfigurera DNS
4. Uppdatera `CORS_ORIGINS` i backend med din nya domän

## 📝 Miljövariabler Sammanfattning

### Frontend (Vercel)
- `REACT_APP_BACKEND_URL`: Backend API URL
- `REACT_APP_TURNSTILE_SITE_KEY`: (Valfritt) Cloudflare Turnstile site key

### Backend (Railway/Render/Fly.io)
- `SUPABASE_DB_URL`: Supabase PostgreSQL connection string
- `JWT_SECRET`: Hemlig nyckel för JWT-tokens
- `CORS_ORIGINS`: Tillåtna CORS-origins (kommaseparerade)
- `MAILTRAP_API_KEY`: (Valfritt) För e-postfunktioner
- `MAILTRAP_SENDER_EMAIL`: (Valfritt)
- `RECIPIENT_EMAIL`: (Valfritt)

## 🔍 Troubleshooting

### Frontend kan inte ansluta till backend
- Kontrollera att `REACT_APP_BACKEND_URL` är korrekt i Vercel
- Kontrollera att backend är tillgänglig och körs
- Kontrollera CORS-inställningar i backend

### Build misslyckas på Vercel
- Kontrollera att `package.json` finns i `frontend/`-mappen
- Kontrollera att alla dependencies är korrekt installerade
- Titta på build-loggarna i Vercel för specifika fel

### Backend startar inte
- Kontrollera att alla miljövariabler är satta
- Kontrollera Supabase connection string (inkludera lösenord!)
- Kontrollera att SQL-schemat har körts i Supabase
- Titta på loggarna i din backend-plattform

## 📚 Ytterligare Resurser

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
