# NISHA GORIEL PHOTOGRAPHY
## Installationsguide

---

## SNABBSTART (Ett Kommando)

```bash
# 1. Kopiera projektet till servern (via FTP, SCP, eller Git)

# 2. Gå till projektmappen
cd /sökväg/till/nishagoriel

# 3. Kör installationen
sudo bash install.sh
```

Det är allt! Scriptet gör resten automatiskt.

---

## VAD INSTALLERAS?

Scriptet installerar och konfigurerar:

| Komponent | Version | Syfte |
|-----------|---------|-------|
| Node.js | 20.x | Frontend-byggverktyg |
| Python | 3.11 | Backend-server |
| MongoDB | 7.0 | Databas |
| Nginx | Senaste | Webbserver |

---

## EFTER INSTALLATION

### 1. Logga in på Admin

Gå till: `http://din-domän.se/admin/login`

| | |
|---|---|
| Email | info@nishagoriel.com |
| Lösenord | admin123 |

**BYT LÖSENORD DIREKT!** Gå till Admin → Settings

### 2. Installera SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d din-domän.se
```

---

## ADMIN-PANELEN

Admin-panelen är INBYGGD i samma webbplats - ingen separat installation behövs.

| URL | Syfte |
|-----|-------|
| /admin/login | Inloggning |
| /admin | Dashboard |
| /admin/gallery | Hantera bilder |
| /admin/film | Hantera videos |
| /admin/messages | Se meddelanden |
| /admin/statistics | Besökarstatistik |
| /admin/typography | Text & typsnitt |
| /admin/settings | Inställningar |

---

## FELSÖKNING

### "Blank sida"

```bash
# Kontrollera att frontend byggdes korrekt
ls -la /var/www/nishagoriel/frontend/build/

# Om tom, bygg om:
cd /var/www/nishagoriel/frontend
npm run build
sudo systemctl reload nginx
```

### "Network Error" / "API svarar inte"

```bash
# Kontrollera backend-status
sudo systemctl status nishagoriel

# Se loggar
sudo journalctl -u nishagoriel -f

# Starta om backend
sudo systemctl restart nishagoriel
```

### "Kan inte logga in"

```bash
# Kontrollera att admin skapades (första start)
sudo journalctl -u nishagoriel | grep "DEFAULT ADMIN"

# Starta om för att skapa admin
sudo systemctl restart nishagoriel
```

### Allmänna kommandon

```bash
# Starta om allt
sudo systemctl restart nishagoriel
sudo systemctl reload nginx

# Se backend-loggar
sudo journalctl -u nishagoriel -f

# Se nginx-loggar
sudo tail -f /var/log/nginx/error.log
```

---

## FILSTRUKTUR PÅ SERVERN

```
/var/www/nishagoriel/
├── backend/
│   ├── server.py          # API-server
│   ├── requirements.txt   # Python-beroenden
│   ├── .env               # Konfiguration
│   └── venv/              # Python virtual env
├── frontend/
│   ├── src/               # React-källkod
│   ├── build/             # Byggd webbplats (Nginx serverar detta)
│   ├── .env               # REACT_APP_BACKEND_URL
│   └── package.json
└── install.sh             # Installationsskript
```

---

## SYSTEMKRAV

- Ubuntu 22.04 LTS (rekommenderas)
- Minst 1 GB RAM
- Minst 10 GB lagring
- Root-åtkomst (sudo)

---

## SUPPORT

Om du stöter på problem:

1. Kolla loggar först (se Felsökning ovan)
2. Starta om tjänsterna
3. Kontrollera att alla portar är öppna (80, 443)
