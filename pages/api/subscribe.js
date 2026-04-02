import { getSubmissionByEmail, updateSubmission } from '../../lib/storage';
const bcrypt = require('bcryptjs');
const LEGACY_PASSWORD = process.env.STAFF_PASSWORD || 'ICC2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, subscription } = req.body;
  if (!email || !password || !subscription) return res.status(400).json({ error: 'Missing fields' });

  const sub = await getSubmissionByEmail(email);
  if (!sub) return res.status(404).json({ error: 'Not found' });

  let valid = sub.passwordHash
    ? await bcrypt.compare(password, sub.passwordHash)
    : password === LEGACY_PASSWORD;
  if (!valid) return res.status(401).json({ error: 'Unauthorized' });

  await updateSubmission(email, { pushSubscription: subscription });
  return res.status(200).json({ success: true });
}
