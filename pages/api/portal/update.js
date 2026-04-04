import { getSubmissionByEmail, updateSubmission } from '../../../lib/storage';
import { verifySession } from '../../../lib/session';
import { v4 as uuidv4 } from 'uuid';

const VALID_DATES = new Set([
  '2026-06-02', '2026-06-09', '2026-06-16', '2026-06-23', '2026-06-30',
  '2026-07-07', '2026-07-14', '2026-07-21', '2026-07-28',
  '2026-08-04', '2026-08-11',
]);

const MIN_HOURS = 0.5;
const MAX_HOURS = 24;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionToken, action, payload } = req.body;
  if (!sessionToken) return res.status(400).json({ error: 'Missing session token' });

  let email;
  try {
    email = await verifySession(sessionToken);
  } catch (e) {
    console.error('Session verify error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
  if (!email) return res.status(401).json({ error: 'Session expired. Please log in again.' });

  try {
    const submission = await getSubmissionByEmail(email);
    if (!submission) return res.status(404).json({ error: 'No application found' });

    if (action === 'update_dates') {
      if (!Array.isArray(payload?.availableDates)) {
        return res.status(400).json({ error: 'Invalid dates payload' });
      }
      // Only persist dates from the canonical schedule
      const sanitized = payload.availableDates.filter(d => VALID_DATES.has(d));
      const ok = await updateSubmission(email, { availableDates: sanitized });
      return res.status(ok ? 200 : 404).json(ok ? { success: true } : { error: 'Not found' });
    }

    if (action === 'add_hours') {
      const hours = Number(payload?.hours);
      if (!payload?.date || isNaN(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
        return res.status(400).json({ error: `Invalid hours entry. Hours must be ${MIN_HOURS}–${MAX_HOURS}.` });
      }
      const entry = {
        id: uuidv4(),
        date: payload.date,
        hours,
        note: String(payload.note || '').slice(0, 200).trim(),
        loggedAt: new Date().toISOString(),
      };
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: [...existing, entry] });
      return res.status(ok ? 200 : 404).json(ok ? { success: true, entry } : { error: 'Not found' });
    }

    if (action === 'delete_hours') {
      if (!payload?.id) return res.status(400).json({ error: 'Missing entry id' });
      const existing = submission.hours || [];
      const ok = await updateSubmission(email, { hours: existing.filter(h => h.id !== payload.id) });
      return res.status(ok ? 200 : 404).json(ok ? { success: true } : { error: 'Not found' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('Portal update error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
