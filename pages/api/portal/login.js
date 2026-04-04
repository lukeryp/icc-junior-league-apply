import { getSubmissionByEmail } from '../../../lib/storage';
import { createSession } from '../../../lib/session';
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) {
      return res.status(404).json({ error: 'No application found for that email. Please apply first.' });
    }

    // Require a hashed password — no legacy shared-password fallback
    if (!submission.passwordHash) {
      return res.status(401).json({ error: 'Account requires re-application. Please submit a new application.' });
    }

    const valid = await bcrypt.compare(password, submission.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const sessionToken = await createSession(submission.email);

    // Strip sensitive fields; include session token for the client to store
    const { passwordHash, pushSubscription, ...profile } = submission;
    return res.status(200).json({ sessionToken, ...profile });
  } catch (e) {
    console.error('Login error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
