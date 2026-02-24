import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, booking_date, venue, message } = req.body;

  // Get real IP from Vercel headers
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown';

  const country = req.headers['x-vercel-ip-country'] || null;
  const city    = req.headers['x-vercel-ip-city']
    ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null;

  const { data, error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, phone, booking_date, venue, message, ip_address: ip, country, city }])
    .select('id').single();

  if (error) {
    console.error('save-contact error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ id: data.id });
}
