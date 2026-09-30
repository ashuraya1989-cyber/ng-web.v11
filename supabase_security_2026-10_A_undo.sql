-- ============================================================
-- ÅNGRA STEG A: tar bort objekten från steg A. Kör B_undo först om steg B körts.
-- ============================================================
begin;

drop table public.email_settings;
drop function public.is_admin();
drop table public.admins;

commit;
