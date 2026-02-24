import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, serviceKey: !!serviceKey });
    return res.status(500).json({ error: 'Server not configured – SUPABASE_SERVICE_ROLE_KEY saknas i Vercel env vars' });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const updates = req.body;
  delete updates.id; // never override primary key from client

  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: 'site_settings', ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.error('save-settings DB error:', error.message, error.details, error.hint);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
