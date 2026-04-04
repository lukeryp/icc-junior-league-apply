import { getSubmissions } from '../../lib/storage';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { password } = req.query;

  if (!MANAGER_PASSWORD) {
    console.error('MANAGER_PASSWORD env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  if (!password || password !== MANAGER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const submissions = await getSubmissions();
    // Strip sensitive fields before sending to the client
    const safe = submissions.map(({ passwordHash, pushSubscription, ...rest }) => rest);
    return res.status(200).json(safe);
  } catch (e) {
    console.error('Submissions fetch error:', e.message);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}
