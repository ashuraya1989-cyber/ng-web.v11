# Vercel Deployment Setup - Steg för Steg

## ⚠️ VIKTIGT: Konfigurera i Vercel UI

När du importerar projektet i Vercel, följ dessa exakta inställningar:

### Steg 1: Projektinställningar

1. **Root Directory**: `frontend`
   - Detta är KRITISKT! Vercel måste veta att frontend-mappen är projektets root.

2. **Build Command**: `npm run build`
   - Vercel kör automatiskt `npm install` först, så du behöver bara build-kommandot.

3. **Output Directory**: `build`
   - Eftersom Root Directory är `frontend`, så är output `build` (inte `frontend/build`).

4. **Install Command**: Lämna TOMT eller `npm install`
   - Vercel kör detta automatiskt.

### Steg 2: Framework Preset

- Välj **"Other"** eller låt Vercel auto-detektera
- Vercel kommer automatiskt detektera React från `frontend/package.json`

### Steg 3: Miljövariabler

Efter att projektet är skapat, lägg till:

- **Name**: `REACT_APP_BACKEND_URL`
- **Value**: Din backend-URL (t.ex. `https://your-backend.railway.app`)

### Steg 4: Deploy

Klicka "Deploy" och vänta på att builden slutförs.

## 🔧 Om det fortfarande inte fungerar

Om du fortfarande får fel om att `frontend`-mappen inte hittas:

1. **Alternativ 1**: I Vercel UI, gå till **Settings** → **General**
2. Scrolla ner till **Root Directory**
3. Sätt det till `frontend`
4. Spara och redeploya

**Alternativ 2**: Om Root Directory inte fungerar:
1. I Vercel UI, ändra Build Command till: `cd frontend && npm install && npm run build`
2. Ändra Output Directory till: `frontend/build`
3. Lämna Root Directory tomt eller sätt till `./`

## ✅ Verifiering

Efter deployment ska du se:
- ✅ Build lyckas utan fel
- ✅ Siten är live på `https://your-project.vercel.app`
- ✅ Frontend kan ansluta till backend (kontrollera i browser console)

## 🐛 Troubleshooting

### "No such file or directory: frontend"
- Kontrollera att Root Directory är satt till `frontend` i Vercel UI
- Eller använd alternativ 2 ovan

### "npm error ERESOLVE"
- Detta händer om npm install körs i fel mapp
- Se till att Root Directory är `frontend`

### "Cannot find module"
- Kontrollera att `frontend/package.json` finns i repository
- Verifiera att alla dependencies är korrekt installerade
