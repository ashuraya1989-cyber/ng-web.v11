# 🚀 Snabbstart: Deploya på Vercel och GitHub

## Steg 1: Skapa GitHub Repository

```bash
# Om du inte redan har ett git repository
git init
git add .
git commit -m "Initial commit"

# Lägg till remote (ersätt YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Nishagoriel_page_v10.git
git branch -M main
git push -u origin main
```

**Eller** skapa repository via [github.com/new](https://github.com/new) med namn `Nishagoriel_page_v10`

## Steg 2: Deploya Backend (Välj en plattform)

### Railway (Rekommenderat - Enklast)
1. Gå till [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Välj `backend`-mappen
4. Lägg till miljövariabler:
   - `MONGO_URL`: MongoDB Atlas connection string
   - `DB_NAME`: `ng_website`
   - `JWT_SECRET`: Generera med `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `CORS_ORIGINS`: Lämna tomt först, uppdatera efter frontend-deployment

### Render
1. Gå till [render.com](https://render.com)
2. "New Web Service" → Välj ditt repo
3. Root Directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`

## Steg 3: Deploya Frontend på Vercel

1. **Logga in på Vercel**: [vercel.com](https://vercel.com) (med GitHub)

2. **Importera projekt**:
   - "Add New..." → "Project"
   - Välj `Nishagoriel_page_v10` repository

3. **Konfigurera**:
   - **Root Directory**: `frontend` (eller lämna tomt om Vercel auto-detekterar)
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`

4. **Miljövariabler**:
   - `REACT_APP_BACKEND_URL`: Din backend-URL (t.ex. `https://your-app.railway.app`)

5. **Deploy**: Klicka "Deploy"

## Steg 4: Uppdatera CORS

Efter frontend är deployad, uppdatera backend:
- Lägg till din Vercel-URL i `CORS_ORIGINS` (t.ex. `https://nishagoriel-page-v10.vercel.app`)

## ✅ Klart!

Din webbplats är nu live på Vercel! 🎉

---

**Detaljerade guider:**
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Fullständig deployment-guide
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub repository setup
