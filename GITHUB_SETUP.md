# GitHub Repository Setup Guide

Denna guide visar hur du skapar och konfigurerar GitHub repository för Nishagoriel_page_v10.

## 🚀 Steg 1: Skapa Repository på GitHub

### Alternativ A: Via GitHub Web Interface (Rekommenderat)

1. Gå till [github.com/new](https://github.com/new)
2. Fyll i:
   - **Repository name**: `Nishagoriel_page_v10`
   - **Description**: `Modern photography portfolio website with admin panel`
   - **Visibility**: Välj Public eller Private
   - **DON'T** initialisera med README, .gitignore eller license (vi har redan dessa)
3. Klicka "Create repository"

### Alternativ B: Via GitHub CLI

```bash
gh repo create Nishagoriel_page_v10 --public --description "Modern photography portfolio website with admin panel"
```

## 🔗 Steg 2: Koppla Lokalt Repository till GitHub

Om du redan har ett lokalt git repository:

```bash
# Kontrollera om du redan har en remote
git remote -v

# Om du har en befintlig remote, ta bort den först
git remote remove origin

# Lägg till ny remote (ersätt YOUR_USERNAME med ditt GitHub-användarnamn)
git remote add origin https://github.com/YOUR_USERNAME/Nishagoriel_page_v10.git

# Kontrollera att remote är korrekt
git remote -v

# Pusha till GitHub
git branch -M main
git push -u origin main
```

## 📝 Steg 3: Verifiera Upload

1. Gå till din repository på GitHub: `https://github.com/YOUR_USERNAME/Nishagoriel_page_v10`
2. Kontrollera att alla filer är uppladdade
3. Kontrollera att README.md visas korrekt

## 🔐 Steg 4: Konfigurera GitHub Secrets (för CI/CD)

Om du vill använda GitHub Actions för automatisk deployment:

1. Gå till din repository på GitHub
2. Klicka på "Settings" → "Secrets and variables" → "Actions"
3. Lägg till följande secrets:
   - `REACT_APP_BACKEND_URL`: Din backend-URL (t.ex. `https://your-backend.railway.app`)

## ✅ Checklista

- [ ] Repository skapat på GitHub med namn `Nishagoriel_page_v10`
- [ ] Lokalt repository kopplat till GitHub remote
- [ ] Alla filer pushade till GitHub
- [ ] README.md visas korrekt på GitHub
- [ ] .gitignore är korrekt konfigurerad (inga känsliga filer committas)

## 🚨 Viktigt: Säkerhet

**Kontrollera att dessa filer INTE är committade:**
- `.env` filer
- `node_modules/`
- `venv/` eller `.venv/`
- `*.pyc` filer
- Känsliga credentials

Om du redan har committat känsliga filer:
```bash
# Ta bort från git history (VAR FÖRSIKTIG!)
git rm --cached .env
git commit -m "Remove .env file"
git push
```

## 📚 Ytterligare Resurser

- [GitHub Documentation](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
