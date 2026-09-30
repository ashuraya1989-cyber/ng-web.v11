import { requireAdmin, getEmailProvider } from './_lib/admin.js';

// Adminpanelen läser mejlinställningarna härifrån; tabellen är stängd för webbläsaren.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ data: { email_provider: await getEmailProvider(auth.supabase) } });
}
