import { getSubmissionByEmail } from '../../../lib/storage';
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'ICC2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  if (password !== STAFF_PASSWORD) return res.status(401).json({ error: 'Incorrect password' });
  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'No application found for that email. Please apply first.' });
    return res.status(200).json(submission);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
