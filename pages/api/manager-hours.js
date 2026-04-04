import { getSubmissionByEmail, updateSubmission } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';

const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

const MIN_HOURS = 0.5;
const MAX_HOURS = 24;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, action, email, payload } = req.body;

  if (!MANAGER_PASSWORD) {
    console.error('MANAGER_PASSWORD env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  if (!password || password !== MANAGER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'Staff member not found' });

    if (action === 'add') {
      const hours = Number(payload?.hours);
      if (isNaN(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
        return res.status(400).json({ error: `Hours must be between ${MIN_HOURS} and ${MAX_HOURS}` });
      }
      // Validate date is a plausible date string (YYYY-MM-DD)
      const date = payload?.date || new Date().toISOString().split('T')[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      const entry = {
        id: uuidv4(),
        date,
        hours,
        note: String(payload?.note || '').slice(0, 200).trim(),
        loggedAt: new Date().toISOString(),
      };
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: [...existing, entry] });
      return res.status(ok ? 200 : 404).json(ok ? { success: true, entry } : { error: 'Update failed' });
    }

    if (action === 'delete') {
      if (!payload?.id) return res.status(400).json({ error: 'Missing entry id' });
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: existing.filter(h => h.id !== payload.id) });
      return res.status(ok ? 200 : 404).json(ok ? { success: true } : { error: 'Update failed' });
    }

    return res.status(400).json({ error: 'Unknown action. Use "add" or "delete".' });
  } catch (e) {
    console.error('manager-hours error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
