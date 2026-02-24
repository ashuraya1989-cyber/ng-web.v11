# Changelog – ng-web.v11

## Ändringar från v10 (alla korrigeringar baserade på fullgranskning 2026-02-23)

### 🔴 Kritiska buggar – Åtgärdade

**BUG 1 – `API_BASE_URL` exporterades aldrig**
- `src/lib/api.js`: Lagt till `export const API_BASE_URL = '';`
- Fixar krasch i `Navbar.jsx` och `VisitorTracker.jsx`

**BUG 2 – `/analytics/visit` POST saknade handler**
- `src/lib/api.js`: Lagt till `if (url === '/analytics/visit') return analyticsAPI.logVisit(data);` i axios-kompatibilitetslagret
- Besöksloggning fungerar nu korrekt

### 🟡 Medelsvåra buggar – Åtgärdade

**BUG 3 – Slideshow `NaN` vid tom bildgalleri (HomePage)**
- `src/pages/HomePage.jsx`: Guard lagd runt `setInterval`-logiken: kör bara modulo om `images.length > 0`

**BUG 4 – `updatePassword` verifierade aldrig nuvarande lösenord**
- `src/lib/api.js`: Implementerad re-autentisering via `signInWithPassword` innan lösenordsbyte
- Returnerar tydligt felmeddelande om fel lösenord anges

**BUG 5 – `replyToMessage` var ett icke-fungerande mock-stub**
- `src/lib/api.js`: Implementerad riktig reply-logik – hämtar originalmeddelande, anropar ny Vercel-funktion
- `frontend/api/send-reply.js`: Ny Vercel API-funktion skapad för att skicka svarsmail via Resend
- Markerar meddelandet som läst efter att svar skickats

**BUG 6 – `avg_duration_seconds` var hårdkodad till 45 sekunder**
- `src/lib/api.js`: Beräknar nu faktisk genomsnittlig besökningstid från `visitors`-tabellen

**BUG 7 – Framer Motion `transition` låg på fel nivå i `getAnimationConfig`**
- `src/lib/animations.js`: `transition` placeras nu korrekt inuti `animate`-objektet

### 🔒 Säkerhetsproblem – Åtgärdade

**SEC-1 – XSS-risk: osanerad användardata injicerades i HTML-epostmall**
- `frontend/api/send-email.js`: Lagt till `escapeHtml()`-funktion som saniterar alla fält (name, email, phone, booking_date, venue, message) innan de injiceras i HTML
- `frontend/api/send-reply.js`: Samma sanitering implementerad i reply-funktionen

**SEC-2 – Cloudflare Turnstile validerades aldrig server-side**
- `frontend/api/send-email.js`: Server-side verifiering mot Cloudflare `siteverify`-API implementerad
- Returnerar 403 om token saknas eller är ogiltig
- `frontend/.env.example`: Lagt till `TURNSTILE_SECRET_KEY`-variabel

### ⚪ Låg prioritet – Åtgärdade

**INFO-1 – `axios` var installerat men aldrig använt**
- `frontend/package.json`: `axios`-beroendet borttaget

**INFO-2 – `Navbar` använde `fetch()` istället för `settingsAPI`**
- `frontend/src/components/layout/Navbar.jsx`: Bytt från rå `fetch(${API_BASE_URL}/settings/public)` till `settingsAPI.getPublicSettings()`

**INFO-3 – Ingen 404-sida**
- `frontend/src/pages/NotFoundPage.jsx`: Ny 404-sida skapad
- `frontend/src/App.js`: Lagt till `<Route path="*" element={<NotFoundPage />} />` som catch-all
