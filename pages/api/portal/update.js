import { getSubmissionByEmail, updateSubmission } from '../../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'ICC2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, action, payload } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  if (password !== STAFF_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'No application found' });

    if (action === 'update_dates') {
      const ok = await updateSubmission(email, { availableDates: payload.availableDates });
      return res.status(ok ? 200 : 404).json(ok ? { success: true } : { error: 'Not found' });
    }

    if (action === 'add_hours') {
      const entry = { id: uuidv4(), date: payload.date, hours: Number(payload.hours), note: payload.note || '', loggedAt: new Date().toISOString() };
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: [...existing, entry] });
      return res.status(ok ? 200 : 404).json(ok ? { success: true, entry } : { error: 'Not found' });
    }

    if (action === 'delete_hours') {
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: existing.filter(h => h.id !== payload.id) });
      return res.status(ok ? 200 : 404).json(ok ? { success: true } : { error: 'Not found' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
