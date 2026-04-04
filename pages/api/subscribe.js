import { getSubmissionByEmail, updateSubmission } from '../../lib/storage';
import { verifySession } from '../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionToken, subscription } = req.body;
  if (!sessionToken || !subscription) return res.status(400).json({ error: 'Missing fields' });

  try {
    const email = await verifySession(sessionToken);
    if (!email) return res.status(401).json({ error: 'Session expired. Please log in again.' });

    const sub = await getSubmissionByEmail(email);
    if (!sub) return res.status(404).json({ error: 'Account not found' });

    await updateSubmission(email, { pushSubscription: subscription });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Subscribe error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
