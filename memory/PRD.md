# Nisha Goriel Photography Portfolio - PRD

## Original Problem Statement
Modern and elegant portfolio website for a photographer and videographer with a comprehensive admin dashboard for content management.

## Core Requirements
- **Pages:** Home, Gallery, Film, and Contact
- **Design:** Full-screen, slider-based design with dark theme (black, white, dark grey)
- **Admin Dashboard:** Secure panel to manage all site content

## User Personas
1. **Site Visitors:** Potential clients viewing the portfolio and booking sessions
2. **Site Owner (Admin):** Photographer managing content, responding to inquiries

## Architecture

### Tech Stack
- **Frontend:** React, React Router, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Python, FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Containerization:** Docker, Docker Compose
- **Email:** Multi-provider support (7 providers)
- **IP Geolocation:** ip-api.com (free public API)

### Project Structure
```
/app/
├── backend/
│   ├── server.py       # FastAPI app, all API routes
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # API client, animations
│   │   └── hooks/      # Custom React hooks
│   └── build/          # Production build
├── Dockerfile          # Backend container
├── Dockerfile.frontend # Frontend container
├── docker-compose.yml  # Container orchestration
├── nginx.conf          # Nginx configuration
├── install.sh          # Manual installation script
├── DEPLOYMENT.md       # Installation guide
└── README.md           # Project documentation
```

### Key API Endpoints
- `POST /api/auth/login` - Admin authentication
- `GET /api/settings/public` - Public settings (includes animations)
- `GET /api/settings/animations` - Animation settings (public)
- `POST /api/settings/test-email` - Test email configuration (auth)
- `PUT /api/settings` - Update settings (auth required)
- `GET/POST /api/gallery` - Gallery image management
- `GET/POST /api/videos` - Video management
- `POST /api/contact` - Contact form submission (with IP tracking)
- `GET /api/analytics` - Visitor analytics (auth required)

### Database Collections
- **users:** `{email, hashed_password}`
- **images:** `{id, url, title, category, order}`
- **videos:** `{id, title, vimeo_id, video_url}`
- **settings:** `{logo_url, contact_info, button_labels, categories, typography, email_provider, animation_settings}`
- **messages:** `{id, name, email, message, ip_address, location, user_agent}`
- **visits:** `{session_id, ip_address, path, start_time, end_time, duration, location}`

---

## Completed Features (January 2026)

### Public Website
- [x] Home page with fullscreen animated slider
- [x] Gallery page with category filtering
- [x] Film/Video page with Vimeo integration
- [x] Contact page with form and IP tracking
- [x] Dark theme design
- [x] Responsive layout
- [x] Dynamic fonts via Google Fonts
- [x] Configurable animations (fade, slide, zoom, bounce)

### Admin Dashboard
- [x] Secure login with JWT authentication
- [x] Dashboard with statistics overview
- [x] Gallery management (upload, edit, delete, reorder)
- [x] Video management (Vimeo/direct links)
- [x] Messages inbox with IP/location/device info
- [x] Typography & Text management
- [x] Visitor Analytics
- [x] Settings (logo, contact info, categories, button labels)
- [x] **Multi-Email Provider Selection** (7 providers)
- [x] **Animation Settings** (configurable from admin)
- [x] Password change functionality

### Email Providers (NEW)
- [x] Mailtrap (1,000/month free)
- [x] Mailgun (5,000/month free)
- [x] SendGrid (100/day free)
- [x] Brevo (300/day free)
- [x] Mailjet (200/day free)
- [x] Resend (3,000/month free)
- [x] SMTP (custom server)
- [x] Test email functionality

### Animation Settings (NEW)
- [x] Hero animation (fade, slide, zoom, bounce, none)
- [x] Gallery animation
- [x] Page transition
- [x] Animation speed (slow, normal, fast)

### Docker Setup (NEW)
- [x] Dockerfile for backend
- [x] Dockerfile.frontend for frontend
- [x] docker-compose.yml for orchestration
- [x] nginx.conf for production
- [x] .env.example template

---

## Default Admin Credentials
- **Email:** info@nishagoriel.com
- **Password:** admin123
- **Note:** Created automatically on first backend start

---

## Quick Start

### Docker (Recommended)
```bash
git clone <repo>
cd nishagoriel
cp .env.example .env
docker-compose up --build
# Open http://localhost:3000
```

### Manual Installation
```bash
sudo bash install.sh
```

---

## Future/Backlog Tasks
- [ ] Email reply from admin dashboard
- [ ] Image optimization on upload
- [ ] SEO meta tags management
- [ ] Backup/restore functionality
- [ ] Multi-language support

---

## Status: COMPLETE ✅
All requested features including Docker setup, multi-email providers, and animations have been implemented.
