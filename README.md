# Nisha Goriel Photography - Serverless Edition

A modern, elegant portfolio website for photographers and videographers, powered entirely by **Vercel** and **Supabase**. No external backend server required!

## 🚀 Snabbstart (Vercel + Supabase)

### 1. Supabase Setup
1. Skapa ett projekt på [supabase.com](https://supabase.com).
2. Gå till **SQL Editor** och kör koden i `supabase_schema.sql` (finns i projektets root).
3. Gå till **Authentication** -> **Users** och lägg till din administratör (`info@nishagoriel.com`).
4. Gå till **Storage**, skapa en bucket som heter `gallery` och sätt den till **Public**.

### 2. Vercel Deployment
1. Importera ditt repository till Vercel.
2. Sätt **Root Directory** till `frontend`.
3. Lägg till dessa **Environment Variables**:
   - `REACT_APP_SUPABASE_URL`: Din Supabase Project URL.
   - `REACT_APP_SUPABASE_ANON_KEY**: Din Supabase Anon Key.
4. Klicka på **Deploy**!

## ✨ Funktioner
- **Serverless**: Ingen separat backend behövs. Allt körs via Vercel och Supabase.
- **Supabase Storage**: Bilder lagras och servas direkt från Supabases globala nätverk.
- **Supabase Auth**: Säker inloggning för admin-panelen.
- **Dynamisk Galleri**: Ladda upp, categorisera och sortera bilder direkt i webbläsaren.
- **Kontaktformulär**: Meddelanden sparas direkt i din databas.

## 📁 Projektstruktur
```
├── frontend/             # All kod för hemsidan och admin-panelen
│   ├── src/lib/api.js    # Hanterar kommunikation med Supabase
│   └── src/lib/supabase.js # Supabase-klienten
├── supabase_schema.sql  # Databasschema (körs i Supabase SQL Editor)
└── README.md
```

## 🛠 Utveckling lokalt
1. `cd frontend`
2. `npm install`
3. Skapa en `.env` fil med din `REACT_APP_SUPABASE_URL` och `REACT_APP_SUPABASE_ANON_KEY`.
4. `npm start`

## 🔒 Säkerhet
Projektet använder **Row Level Security (RLS)** i Supabase. Detta innebär att besökare bara kan läsa data, medan bara inloggade administratörer kan ändra eller ta bort innehåll.

---
**License**: MIT
