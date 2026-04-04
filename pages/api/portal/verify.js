import { getSubmissionByEmail } from '../../../lib/storage';
import { verifySession } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionToken } = req.body;
  if (!sessionToken) return res.status(400).json({ error: 'Missing token' });

  try {
    const email = await verifySession(sessionToken);
    if (!email) return res.status(401).json({ error: 'Session expired. Please log in again.' });

    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'Account not found' });

    const { passwordHash, pushSubscription, ...safe } = submission;
    return res.status(200).json(safe);
  } catch (e) {
    console.error('Session verify error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
