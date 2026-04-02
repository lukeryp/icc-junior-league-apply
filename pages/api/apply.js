import { addSubmission } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    fullName,
    email,
    phone,
    juniorExperience,
    golfExperience,
    returning,
    bagRoom,
    availableDates,
  } = req.body;

  // Basic server-side validation
  if (!fullName?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!Array.isArray(availableDates) || availableDates.length < 5) {
    return res.status(400).json({ error: 'Must select at least 5 dates' });
  }

  const submission = {
    id: uuidv4(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    juniorExperience: (juniorExperience || '').trim(),
    golfExperience: (golfExperience || '').trim(),
    returning: Boolean(returning),
    bagRoom: Boolean(bagRoom),
    availableDates,
    submittedAt: new Date().toISOString(),
  };

  try {
    await addSubmission(submission);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Submission error:', e);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}
