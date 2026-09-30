-- ============================================================
-- Säkerhet 2026-10, STEG A (förbered) — bara tillägg, gamla koden påverkas inte.
-- Skapar admin-lista, is_admin() och en kopia av mejlinställningarna i en stängd
-- tabell. Efter detta fungerar Vercels förhandsversion fullt ut.
-- Ångra: supabase_security_2026-10_A_undo.sql
-- OBS: ändra inte mejlinställningarna i adminpanelen mellan steg A och steg B.
-- ============================================================
begin;

-- ---------- 1. Admin-lista ----------
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Den enda administratören. Avbryter hela transaktionen om kontot inte finns.
do $$
declare n int;
begin
  insert into public.admins (user_id)
  select id from auth.users where email = 'ADMIN_EMAIL_HÄR';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'Hittade % konton för admin-e-posten, väntade exakt 1', n;
  end if;
end $$;

-- Används i alla regler. security definer så att den kan läsa admins
-- trots att anon/authenticated saknar rättigheter till tabellen.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 2. Mejlinställningar i egen, stängd tabell ----------
-- Inga regler + inga rättigheter = bara service role (Vercel-funktionerna) når den.
create table public.email_settings (
  id text primary key default 'site_settings',
  email_provider jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.email_settings enable row level security;
revoke all on public.email_settings from anon, authenticated;

insert into public.email_settings (id, email_provider)
select id, coalesce(email_provider, '{}'::jsonb) from public.settings;

commit;
