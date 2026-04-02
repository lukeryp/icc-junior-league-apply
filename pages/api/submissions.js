import { getSubmissions } from '../../lib/storage';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || '1909';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { password } = req.query;

  if (!password || password !== MANAGER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const submissions = await getSubmissions();
    return res.status(200).json(submissions);
  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}
