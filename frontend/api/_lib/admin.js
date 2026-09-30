import { createClient } from '@supabase/supabase-js';

// Filer under api/_lib blir inte egna Vercel-funktioner (understreck = privat).

// Service role-klient: når email_settings och admins, som är stängda för anon/authenticated.
export function serviceClient() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY saknas i Vercel env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Släpper bara igenom anrop med en giltig inloggningstoken för en användare i public.admins.
// Svarar själv med 401/403 och returnerar null när anropet ska stoppas.
export async function requireAdmin(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Inte inloggad' });
    return null;
  }

  let supabase;
  try {
    supabase = serviceClient();
  } catch (e) {
    res.status(500).json({ error: e.message });
    return null;
  }

  const { data: { user } = {}, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Ogiltig eller utgången inloggning' });
    return null;
  }

  const { data: admin } = await supabase
    .from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) {
    res.status(403).json({ error: 'Saknar behörighet' });
    return null;
  }

  return { user, supabase };
}

export async function getEmailProvider(supabase) {
  const { data, error } = await supabase
    .from('email_settings').select('email_provider').eq('id', 'site_settings').maybeSingle();
  if (error) console.error('email_settings fetch error:', error);
  return data?.email_provider || {};
}
