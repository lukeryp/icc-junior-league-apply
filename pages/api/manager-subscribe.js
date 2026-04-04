import { addManagerSubscription } from '../../lib/storage';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, subscription } = req.body;
  if (!password || !subscription) return res.status(400).json({ error: 'Missing fields' });

  if (!MANAGER_PASSWORD) {
    console.error('MANAGER_PASSWORD env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  if (password !== MANAGER_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await addManagerSubscription(subscription);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Manager subscribe error:', e.message);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}
