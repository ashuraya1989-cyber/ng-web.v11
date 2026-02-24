#!/bin/bash
# ============================================================
# NISHA GORIEL PHOTOGRAPHY - KOMPLETT INSTALLATION
# ============================================================
# ETT ENDA SKRIPT FÖR HELA INSTALLATIONEN
# 
# Kör som root: sudo bash install.sh
# ============================================================

set -e  # Stoppa vid första fel

# Färger
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║     ${BLUE}NISHA GORIEL PHOTOGRAPHY${CYAN}                             ║${NC}"
echo -e "${CYAN}║     ${NC}Komplett Installation${CYAN}                                  ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# KONTROLLERA ATT VI KÖR SOM ROOT
# ============================================================
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ FEL: Du måste köra detta skript som root${NC}"
    echo -e "${YELLOW}   Kör: sudo bash install.sh${NC}"
    exit 1
fi

# ============================================================
# FRÅGA ANVÄNDAREN OM KONFIGURATION
# ============================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 1: Konfiguration${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Domän
read -p "Ange din domän (t.ex. nishagoriel.se): " DOMAIN
while [ -z "$DOMAIN" ]; do
    echo -e "${RED}Domän kan inte vara tom!${NC}"
    read -p "Ange din domän: " DOMAIN
done

# Admin email
read -p "Admin email [info@nishagoriel.com]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-info@nishagoriel.com}

# Admin lösenord
read -p "Admin lösenord [admin123]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}

# Generera säker SECRET_KEY
SECRET_KEY=$(openssl rand -hex 32)

echo ""
echo -e "${GREEN}✓ Konfiguration mottagen:${NC}"
echo -e "  Domän:    ${CYAN}${DOMAIN}${NC}"
echo -e "  Email:    ${CYAN}${ADMIN_EMAIL}${NC}"
echo -e "  Lösenord: ${CYAN}${ADMIN_PASSWORD}${NC}"
echo ""
read -p "Stämmer detta? (j/n): " CONFIRM
if [[ "$CONFIRM" != "j" && "$CONFIRM" != "J" && "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo -e "${YELLOW}Avbryter. Kör scriptet igen för att börja om.${NC}"
    exit 0
fi

APP_DIR="/var/www/nishagoriel"

# ============================================================
# STEG 2: INSTALLERA SYSTEMBEROENDEN
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 2: Installerar systemberoenden...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

apt update
apt install -y curl wget gnupg2 software-properties-common git

# Node.js 20.x
echo -e "${BLUE}→ Installerar Node.js 20.x...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Python 3.11
echo -e "${BLUE}→ Installerar Python 3.11...${NC}"
apt install -y python3.11 python3.11-venv python3-pip 2>/dev/null || apt install -y python3 python3-venv python3-pip
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# MongoDB
echo -e "${BLUE}→ Installerar MongoDB 7.0...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt update
    apt install -y mongodb-org
fi
systemctl daemon-reload
systemctl enable mongod
systemctl start mongod
sleep 3
echo -e "${GREEN}✓ MongoDB startad${NC}"

# Nginx
echo -e "${BLUE}→ Installerar Nginx...${NC}"
apt install -y nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx installerad${NC}"

# ============================================================
# STEG 3: KOPIERA PROJEKTFILER
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 3: Kopierar projektfiler...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Skapa mapp om den inte finns
mkdir -p $APP_DIR

# Kolla om vi kör från projektmappen
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ]; then
    echo -e "${BLUE}→ Kopierar filer från $SCRIPT_DIR...${NC}"
    cp -r "$SCRIPT_DIR/backend" $APP_DIR/
    cp -r "$SCRIPT_DIR/frontend" $APP_DIR/
    echo -e "${GREEN}✓ Filer kopierade till $APP_DIR${NC}"
else
    echo -e "${RED}❌ Kunde inte hitta backend/ och frontend/ mappar${NC}"
    echo -e "${YELLOW}   Se till att köra scriptet från projektmappen${NC}"
    exit 1
fi

# ============================================================
# STEG 4: KONFIGURERA BACKEND
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 4: Konfigurerar backend...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd $APP_DIR/backend

# Skapa virtuell miljö
python3 -m venv venv
source venv/bin/activate

# Installera beroenden
pip install --upgrade pip
pip install -r requirements.txt

# Skapa .env
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=nishagoriel_photography
SECRET_KEY=${SECRET_KEY}
MAILTRAP_API_KEY=
RECIPIENT_EMAIL=${ADMIN_EMAIL}
EOF

echo -e "${GREEN}✓ Backend konfigurerad${NC}"

# ============================================================
# STEG 5: KONFIGURERA FRONTEND
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 5: Konfigurerar frontend...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd $APP_DIR/frontend

# Skapa .env MED HTTPS
cat > .env << EOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
EOF

# Installera och bygg
npm install
npm run build

echo -e "${GREEN}✓ Frontend byggd${NC}"

# ============================================================
# STEG 6: SKAPA BACKEND-TJÄNST (SYSTEMD)
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 6: Skapar backend-tjänst...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > /etc/systemd/system/nishagoriel.service << EOF
[Unit]
Description=Nisha Goriel Photography Backend
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/backend/venv/bin"
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nishagoriel
echo -e "${GREEN}✓ Backend-tjänst skapad${NC}"

# ============================================================
# STEG 7: KONFIGURERA NGINX
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 7: Konfigurerar Nginx...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > /etc/nginx/sites-available/nishagoriel << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${APP_DIR}/frontend/build;
    index index.html;

    # Gzip komprimering
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend - React Router (ALLA sidor inkl /admin)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        client_max_body_size 100M;
    }

    # Cache för statiska filer
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Aktivera
ln -sf /etc/nginx/sites-available/nishagoriel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testa konfigurationen
nginx -t

echo -e "${GREEN}✓ Nginx konfigurerad${NC}"

# ============================================================
# STEG 8: SÄTT RÄTTIGHETER
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 8: Sätter rättigheter...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

echo -e "${GREEN}✓ Rättigheter satta${NC}"

# ============================================================
# STEG 9: STARTA ALLT
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 9: Startar tjänster...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Starta backend (skapar admin automatiskt)
systemctl start nishagoriel
sleep 5

# Ladda om nginx
systemctl reload nginx

echo -e "${GREEN}✓ Alla tjänster startade${NC}"

# ============================================================
# STEG 10: VERIFIERA INSTALLATION
# ============================================================
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  STEG 10: Verifierar installation...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ERRORS=0

# Testa backend
echo -n "→ Backend API: "
BACKEND_TEST=$(curl -s http://127.0.0.1:8001/api/ 2>/dev/null | grep -o "message" || echo "FAIL")
if [ "$BACKEND_TEST" = "message" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FEL${NC}"
    ERRORS=$((ERRORS+1))
fi

# Testa admin login
echo -n "→ Admin login: "
LOGIN_TEST=$(curl -s -X POST http://127.0.0.1:8001/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" 2>/dev/null | grep -o "access_token" || echo "FAIL")
if [ "$LOGIN_TEST" = "access_token" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FEL${NC}"
    ERRORS=$((ERRORS+1))
fi

# Testa nginx/frontend
echo -n "→ Frontend: "
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ 2>/dev/null)
if [ "$NGINX_TEST" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FEL (HTTP $NGINX_TEST)${NC}"
    ERRORS=$((ERRORS+1))
fi

# ============================================================
# SLUTRESULTAT
# ============================================================
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║     ✓ INSTALLATION LYCKADES!                               ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}║     ⚠ INSTALLATION AVSLUTAD MED $ERRORS FEL                    ║${NC}"
    echo -e "${RED}║                                                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  WEBBPLATS:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Publik sida:    ${BLUE}http://${DOMAIN}${NC}"
echo -e "  Admin panel:    ${BLUE}http://${DOMAIN}/admin/login${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  ADMIN-INLOGGNING:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Email:          ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "  Lösenord:       ${YELLOW}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "${RED}  ⚠ BYT LÖSENORD DIREKT I ADMIN → SETTINGS!${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  NÄSTA STEG - SSL (HTTPS):${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. Installera certbot:"
echo -e "     ${YELLOW}sudo apt install certbot python3-certbot-nginx${NC}"
echo ""
echo -e "  2. Skapa SSL-certifikat:"
echo -e "     ${YELLOW}sudo certbot --nginx -d ${DOMAIN}${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  FELSÖKNING:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Backend loggar:  ${YELLOW}sudo journalctl -u nishagoriel -f${NC}"
echo -e "  Nginx loggar:    ${YELLOW}sudo tail -f /var/log/nginx/error.log${NC}"
echo -e "  Starta om:       ${YELLOW}sudo systemctl restart nishagoriel${NC}"
echo ""
