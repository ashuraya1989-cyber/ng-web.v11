#!/bin/bash
# =============================================================================
# NISHA GORIEL PHOTOGRAPHY - Setup Script
# =============================================================================
# Supports: Local development (Node + Python + Supabase/PostgreSQL) OR Docker
# Run: chmod +x setup.sh && ./setup.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

command_exists() { command -v "$1" >/dev/null 2>&1; }

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     ${BLUE}NISHA GORIEL PHOTOGRAPHY${CYAN} - Setup                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# -----------------------------------------------------------------------------
# Choose mode: Docker or Local
# -----------------------------------------------------------------------------
echo -e "${YELLOW}How do you want to run the project?${NC}"
echo "  1) Docker (recommended - one command, no local Node/Python)"
echo "  2) Local development (Node.js + Python + Supabase on this machine)"
echo ""
read -p "Enter 1 or 2 [default: 1]: " MODE
MODE=${MODE:-1}

if [ "$MODE" = "2" ]; then
    # =========================================================================
    # LOCAL DEVELOPMENT SETUP
    # =========================================================================
    echo ""
    echo -e "${CYAN}━━━ Local development setup ━━━${NC}"

    if ! command_exists node; then
        echo -e "${RED}[ERROR] Node.js is not installed. Install Node.js 20+ from https://nodejs.org/${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Node.js $(node --version)"

    if ! command_exists python3; then
        echo -e "${RED}[ERROR] Python 3 is not installed. Install Python 3.11+ from https://www.python.org/${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Python $(python3 --version)"

    # Backend
    echo ""
    echo -e "${YELLOW}Setting up backend...${NC}"
    cd backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo -e "${GREEN}[OK]${NC} Created virtual environment"
    fi
    source venv/bin/activate
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    echo -e "${GREEN}[OK]${NC} Backend dependencies installed"

    if [ ! -f ".env" ]; then
        cp .env.example .env
        JWT=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "change-me-$(date +%s)")
        sed -i.bak "s/your-secure-secret-key-change-this-in-production/$JWT/" .env 2>/dev/null || true
        echo -e "${GREEN}[OK]${NC} Created backend/.env (JWT_SECRET set)"
    fi
    deactivate 2>/dev/null || true
    cd ..

    # Frontend
    echo ""
    echo -e "${YELLOW}Setting up frontend...${NC}"
    cd frontend
    if [ ! -d "node_modules" ]; then
        (command_exists yarn && yarn install) || npm install
        echo -e "${GREEN}[OK]${NC} Frontend dependencies installed"
    else
        echo -e "${GREEN}[OK]${NC} Frontend dependencies already present"
    fi
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}[OK]${NC} Created frontend/.env"
    fi
    cd ..

    echo ""
    echo -e "${GREEN}✓ Local setup complete.${NC}"
    echo ""
    echo -e "Ensure Supabase is prepared (see SUPABASE_SETUP.md for instructions)."
    echo ""
    echo -e "Start the app: ${GREEN}npm start${NC}"
    echo -e "  Backend:  ${BLUE}http://localhost:8000${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
    echo -e "  Admin:    ${BLUE}http://localhost:3000/admin/login${NC} (info@nishagoriel.com / admin123)"
    echo ""
    exit 0
fi

# =============================================================================
# DOCKER SETUP
# =============================================================================
echo ""
echo -e "${CYAN}━━━ Docker setup ━━━${NC}"

if ! command_exists docker; then
    echo -e "${RED}[ERROR] Docker is not installed. Install Docker from https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Docker $(docker --version)"

COMPOSE_CMD=""
if command_exists docker-compose; then
    COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}[ERROR] Docker Compose not found. Install it or use: docker compose${NC}"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Docker Compose available"

# Root .env for Docker
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        JWT=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "change-me-$(date +%s)")
        if [ -n "$JWT" ] && [ "$JWT" != "change-me-"* ]; then
            sed -i.bak "s/change-this-secret-key-in-production/$JWT/" .env 2>/dev/null || true
        fi
        echo -e "${GREEN}[OK]${NC} Created .env from .env.example"
    else
        echo -e "${YELLOW}[WARNING]${NC} No .env.example found. Creating minimal .env..."
        cat > .env << 'ENVEOF'
JWT_SECRET=change-this-secret-key-in-production
PORT=3000
ENVEOF
        echo -e "${RED}Please edit .env and set a secure JWT_SECRET before starting.${NC}"
    fi
fi

# Check JWT_SECRET is set and not default
if grep -q "JWT_SECRET=change-this-secret-key" .env 2>/dev/null || grep -q "JWT_SECRET=$" .env 2>/dev/null; then
    echo -e "${YELLOW}[WARNING]${NC} Set a secure JWT_SECRET in .env (e.g. run: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\")"
fi

echo ""
echo -e "${YELLOW}Building and starting containers...${NC}"
$COMPOSE_CMD up -d --build

echo ""
echo -e "${GREEN}✓ Docker setup complete.${NC}"
DOCKER_PORT=$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 || true)
DOCKER_PORT=${DOCKER_PORT:-3000}
echo ""
echo -e "Website:  ${BLUE}http://localhost:${DOCKER_PORT}${NC}"
echo -e "Admin:    ${BLUE}http://localhost:${DOCKER_PORT}/admin/login${NC}"
echo -e "  Email: ${YELLOW}info@nishagoriel.com${NC}  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "Commands: ${BLUE}$COMPOSE_CMD ps${NC} (status)  ${BLUE}$COMPOSE_CMD logs -f${NC} (logs)  ${BLUE}$COMPOSE_CMD down${NC} (stop)"
echo ""
