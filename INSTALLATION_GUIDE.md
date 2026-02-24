# 🚀 Snabb Installation Guide - Vercel + Supabase

Denna guide visar hur du installerar och deployar projektet på Vercel och Supabase på enklast möjliga sätt.

## ⚡ Snabbstart (5 minuter)

### Steg 1: Supabase Setup (2 min)

1. Gå till [supabase.com](https://supabase.com) och skapa konto (gratis)
2. Klicka "New Project"
3. Fyll i projektnamn och välj region
4. **VIKTIGT**: Spara databaslösenordet!
5. Vänta tills projektet är klart (~1-2 min)

### Steg 2: Skapa Databastabeller (1 min)

1. I Supabase Dashboard → **SQL Editor** (vänstermenyn)
2. Klicka "New Query"
3. Öppna filen `backend/supabase_schema.sql` från detta projekt
4. Kopiera hela innehållet och klistra in i SQL Editor
5. Klicka "Run" (Ctrl+Enter)
6. ✅ Kontrollera att inga fel visas

### Steg 3: Hämta Connection String (30 sek)

1. Supabase Dashboard → **Project Settings** (kugghjulet)
2. Klicka **Database** i vänstermenyn
3. Scrolla ner till **Connection String**
4. Välj **URI** tab
5. Kopiera connection string
6. Ersätt `[YOUR-PASSWORD]` med ditt lösenord från Steg 1

Exempel:
```
postgresql://postgres:DITT_LÖSENORD@abc123.supabase.co:5432/postgres
```

### Steg 4: Deploya Backend på Railway (2 min)

1. Gå till [railway.app](https://railway.app) och logga in med GitHub
2. Klicka "New Project" → "Deploy from GitHub repo"
3. Välj ditt repository: `ashuraya1989-cyber/ng_page_v10`
4. Railway detekterar automatiskt Python-projektet
5. Klicka på servicen → **Variables** tab
6. Lägg till dessa miljövariabler:

```
SUPABASE_DB_URL=postgresql://postgres:DITT_LÖSENORD@abc123.supabase.co:5432/postgres
JWT_SECRET=generera-med-python-kommando-nedan
CORS_ORIGINS=https://din-vercel-url.vercel.app
```

7. Generera JWT_SECRET:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

8. Railway deployar automatiskt! ✅
9. Kopiera backend-URL:en (t.ex. `https://nishagoriel-backend.railway.app`)

### Steg 5: Deploya Frontend på Vercel (2 min)

1. Gå till [vercel.com](https://vercel.com) och logga in med GitHub
2. Klicka "Add New..." → "Project"
3. Välj repository: `ashuraya1989-cyber/ng_page_v10`
4. Vercel detekterar automatiskt React-projektet
5. Konfigurera:
   - **Root Directory**: `frontend` (eller lämna tomt)
   - **Build Command**: `npm install && npm run build` (auto-detekterat)
   - **Output Directory**: `build` (auto-detekterat)
6. Klicka **Environment Variables**
7. Lägg till:
   ```
   REACT_APP_BACKEND_URL=https://din-backend-url.railway.app
   ```
8. Klicka "Deploy"
9. ✅ Klart! Din sida är live!

### Steg 6: Uppdatera CORS (30 sek)

1. Gå tillbaka till Railway → din backend service
2. Öppna **Variables** tab
3. Uppdatera `CORS_ORIGINS` med din Vercel-URL:
   ```
   CORS_ORIGINS=https://din-projekt.vercel.app
   ```
4. Backend startar om automatiskt

## ✅ Klart!

Din webbplats är nu live på Vercel med Supabase som databas! 🎉

**Default Admin Login:**
- Email: `info@nishagoriel.com`
- Password: `admin123`
- ⚠️ **VIKTIGT**: Byt lösenord direkt efter första inloggningen!

## 🔧 Lokal Utveckling (Valfritt)

Om du vill köra projektet lokalt:

```bash
# 1. Klona repository
git clone https://github.com/ashuraya1989-cyber/ng_page_v10.git
cd ng_page_v10

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Redigera .env och lägg till SUPABASE_DB_URL och JWT_SECRET

# 3. Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Redigera .env och lägg till REACT_APP_BACKEND_URL=http://localhost:8000

# 4. Starta
cd ..
npm start
```

## 📚 Ytterligare Hjälp

- **Supabase Setup**: Se [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Vercel Deployment**: Se [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **GitHub Setup**: Se [GITHUB_SETUP.md](./GITHUB_SETUP.md)

## 🐛 Troubleshooting

### Backend startar inte
- Kontrollera att `SUPABASE_DB_URL` är korrekt (inkludera lösenord!)
- Kontrollera att SQL-schemat har körts i Supabase
- Titta på Railway logs för felmeddelanden

### Frontend kan inte ansluta till backend
- Kontrollera att `REACT_APP_BACKEND_URL` är korrekt i Vercel
- Kontrollera att backend är tillgänglig (testa URL:en i webbläsaren)
- Kontrollera CORS-inställningar i backend

### Databasfel
- Kontrollera att alla tabeller finns i Supabase (kör schema igen)
- Kontrollera connection string format
- Kontrollera att Row Level Security är inaktiverad (se SUPABASE_SETUP.md)
