import { requireAdmin } from './_lib/admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await requireAdmin(req, res);
  if (!auth) return;
  const { supabase } = auth;

  const { id, email_provider, ...updates } = req.body || {}; // id styrs aldrig av klienten
  const now = new Date().toISOString();

  // Mejlinställningarna ligger i den stängda tabellen email_settings
  if (email_provider && typeof email_provider === 'object') {
    const { error } = await supabase
      .from('email_settings')
      .upsert({ id: 'site_settings', email_provider, updated_at: now });
    if (error) {
      console.error('save-settings email_settings error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: 'site_settings', ...updates, updated_at: now })
    .select()
    .single();

  if (error) {
    console.error('save-settings DB error:', error.message, error.details, error.hint);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
