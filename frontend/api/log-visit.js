import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role för server-side skrivning
);

export default async function handler(req, res) {
  // Tillåt endast POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page_visited, referrer } = req.body;

    // ── Hämta IP från Vercel headers ──────────────────────────────
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    // ── Hämta geo-data från Vercel inbyggda headers ───────────────
    // Vercel sätter dessa automatiskt via Edge Network
    const country  = req.headers['x-vercel-ip-country']       || null;
    const region   = req.headers['x-vercel-ip-country-region'] || null;
    const city     = req.headers['x-vercel-ip-city']
      ? decodeURIComponent(req.headers['x-vercel-ip-city'])
      : null;

    // ── User-agent ────────────────────────────────────────────────
    const user_agent = req.headers['user-agent'] || null;

    // ── Spara till Supabase ───────────────────────────────────────
    const { data, error } = await supabase
      .from('visitors')
      .insert([{
        ip_address:   ip,
        country:      country,
        region:       region,
        city:         city,
        page_visited: page_visited || '/',
        user_agent:   user_agent,
        referrer:     referrer || null,
        visit_start:  new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ id: data.id });

  } catch (err) {
    console.error('log-visit error:', err);
    return res.status(500).json({ error: err.message });
  }
}
