import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { duration_seconds } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing visit id' });
    }

    const { error } = await supabase
      .from('visitors')
      .update({
        duration_seconds: duration_seconds,
        visit_end: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('update-visit error:', err);
    return res.status(500).json({ error: err.message });
  }
}
