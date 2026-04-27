import { getSubmissions, deleteSubmission, updateSubmission, getSubmissionByEmail } from '../../lib/storage';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (!MANAGER_PASSWORD) {
    console.error('MANAGER_PASSWORD env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (req.method === 'GET') {
    const { password } = req.query;
    if (!password || password !== MANAGER_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const submissions = await getSubmissions();
      const safe = submissions.map(({ passwordHash, pushSubscription, ...rest }) => rest);
      return res.status(200).json(safe);
    } catch (e) {
      console.error('Submissions fetch error:', e.message);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  if (req.method === 'DELETE') {
    const { password, emails, email } = req.body || {};
    if (!password || password !== MANAGER_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const list = Array.isArray(emails) ? emails : (email ? [email] : []);
    if (list.length === 0) {
      return res.status(400).json({ error: 'No email(s) provided' });
    }
    try {
      let deleted = 0;
      for (const e of list) {
        if (typeof e !== 'string') continue;
        const ok = await deleteSubmission(e);
        if (ok) deleted += 1;
      }
      return res.status(200).json({ deleted });
    } catch (e) {
      console.error('Submissions delete error:', e.message);
      return res.status(500).json({ error: 'Failed to delete' });
    }
  }

  if (req.method === 'PATCH') {
    const { password, email: originalEmail, updates } = req.body || {};
    if (!password || password !== MANAGER_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!originalEmail || !updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Missing email or updates' });
    }
    const patch = {};
    if (typeof updates.phone === 'string') {
      const phone = updates.phone.trim();
      if (!phone) return res.status(400).json({ error: 'Phone cannot be empty' });
      patch.phone = phone;
    }
    if (typeof updates.email === 'string') {
      const newEmail = updates.email.trim().toLowerCase();
      if (!EMAIL_RE.test(newEmail)) return res.status(400).json({ error: 'Invalid email' });
      if (newEmail !== originalEmail.toLowerCase().trim()) {
        const conflict = await getSubmissionByEmail(newEmail);
        if (conflict) return res.status(409).json({ error: 'Another applicant already uses that email' });
        patch.email = newEmail;
      }
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    try {
      const ok = await updateSubmission(originalEmail, patch);
      if (!ok) return res.status(404).json({ error: 'Applicant not found' });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('Submissions patch error:', e.message);
      return res.status(500).json({ error: 'Failed to update' });
    }
  }

  return res.status(405).end();
}
