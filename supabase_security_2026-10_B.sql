-- ============================================================
-- Säkerhet 2026-10, STEG B (lås) — körs direkt före merge av PR:en.
-- Tar bort email_provider ur den publika tabellen och byter alla regler till
-- is_admin(). Kräver att steg A redan är kört.
-- Ångra: supabase_security_2026-10_B_undo.sql
-- ============================================================
begin;

alter table public.settings drop column email_provider;


-- ---------- 3. Regler: settings ----------
drop policy "Admins can manage settings" on public.settings;
drop policy "Public can view public settings" on public.settings;
create policy "Public can view settings" on public.settings
  for select using (true);
create policy "Admin can manage settings" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 4. Regler: gallery ----------
drop policy "Admins can manage gallery" on public.gallery;
create policy "Admin can manage gallery" on public.gallery
  for all using (public.is_admin()) with check (public.is_admin());
-- "Public can view gallery" (select true) behålls.

-- ---------- 5. Regler: videos ----------
drop policy "Admins can manage videos" on public.videos;
create policy "Admin can manage videos" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());
-- "Public can view videos" (select true) behålls.

-- ---------- 6. Regler: contact_messages ----------
drop policy "Admins can manage contact messages" on public.contact_messages;
create policy "Admin can manage contact messages" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());
-- "Public can submit contact messages" (insert) behålls — kontaktformulärets reserv.

-- ---------- 7. Regler: visitors ----------
drop policy "Admins can view analytics" on public.visitors;
drop policy "Admins can update visits" on public.visitors;
create policy "Admin can manage visits" on public.visitors
  for all using (public.is_admin()) with check (public.is_admin());
-- "Public can log visits" (insert) behålls. Besökstiden uppdateras via
-- /api/update-visit med service role, så ingen publik UPDATE behövs.

-- ---------- 8. Regler: storage (bucket gallery) ----------
drop policy "Authenticated users can upload gallery images" on storage.objects;
drop policy "Authenticated users can update gallery images" on storage.objects;
drop policy "Authenticated users can delete gallery images" on storage.objects;
create policy "Admin can upload gallery images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());
create policy "Admin can update gallery images" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());
create policy "Admin can delete gallery images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
-- "Public read gallery images" behålls.

commit;
