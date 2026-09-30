-- ============================================================
-- ÅNGRA STEG B: återställer reglerna exakt som de var före 2026-10 och
-- flyttar mejlinställningarna tillbaka till settings.email_provider.
-- Tabellerna från steg A ligger kvar (ångra dem med A_undo).
-- OBS: återställer även de osäkra reglerna. Kör bara tillsammans med
-- att den gamla koden driftsätts igen (revert av PR:en).
-- ============================================================
begin;

-- ---------- Mejlinställningar tillbaka ----------
alter table public.settings add column email_provider jsonb;
update public.settings s
   set email_provider = e.email_provider
  from public.email_settings e
 where e.id = s.id;

-- ---------- storage ----------
drop policy "Admin can upload gallery images" on storage.objects;
drop policy "Admin can update gallery images" on storage.objects;
drop policy "Admin can delete gallery images" on storage.objects;
create policy "Authenticated users can upload gallery images" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery');
create policy "Authenticated users can update gallery images" on storage.objects
  for update to authenticated using (bucket_id = 'gallery');
create policy "Authenticated users can delete gallery images" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery');

-- ---------- visitors ----------
drop policy "Admin can manage visits" on public.visitors;
create policy "Admins can view analytics" on public.visitors
  for select using (auth.role() = 'authenticated');
create policy "Admins can update visits" on public.visitors
  for update using (true);

-- ---------- contact_messages ----------
drop policy "Admin can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages" on public.contact_messages
  for all using (auth.role() = 'authenticated');

-- ---------- videos ----------
drop policy "Admin can manage videos" on public.videos;
create policy "Admins can manage videos" on public.videos
  for all using (auth.role() = 'authenticated');

-- ---------- gallery ----------
drop policy "Admin can manage gallery" on public.gallery;
create policy "Admins can manage gallery" on public.gallery
  for all using (auth.role() = 'authenticated');

-- ---------- settings ----------
drop policy "Admin can manage settings" on public.settings;
drop policy "Public can view settings" on public.settings;
create policy "Admins can manage settings" on public.settings
  for all using (true);
create policy "Public can view public settings" on public.settings
  for select using (true);

commit;
