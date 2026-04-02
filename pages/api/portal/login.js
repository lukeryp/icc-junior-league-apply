import { getSubmissionByEmail } from '../../../lib/storage';
const bcrypt = require('bcryptjs');
const LEGACY_PASSWORD = process.env.STAFF_PASSWORD || 'ICC2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'No application found for that email. Please apply first.' });

    // Check password: if submission has a hashed password use bcrypt, otherwise fallback to legacy shared password
    let valid = false;
    if (submission.passwordHash) {
      valid = await bcrypt.compare(password, submission.passwordHash);
    } else {
      valid = password === LEGACY_PASSWORD;
    }

    if (!valid) return res.status(401).json({ error: 'Incorrect password' });
    // Strip password hash before returning
    const { passwordHash, ...safe } = submission;
    return res.status(200).json(safe);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
