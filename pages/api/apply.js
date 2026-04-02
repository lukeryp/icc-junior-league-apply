import { addSubmission, getSubmissionByEmail, updateSubmission } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { fullName, email, phone, juniorExperience, golfExperience, returning, bagRoom, availableDates, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !phone?.trim())
    return res.status(400).json({ error: 'Missing required fields' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email' });
  if (!Array.isArray(availableDates))
    return res.status(400).json({ error: 'Invalid dates' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const normalEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await getSubmissionByEmail(normalEmail);

    if (existing) {
      // Re-application: update dates and password, keep everything else
      await updateSubmission(normalEmail, {
        availableDates,
        passwordHash,
        juniorExperience: (juniorExperience || '').trim(),
        golfExperience: (golfExperience || '').trim(),
        returning: Boolean(returning),
        bagRoom: Boolean(bagRoom),
        phone: phone.trim(),
        fullName: fullName.trim(),
      });
      return res.status(200).json({ success: true, updated: true });
    }

    const submission = {
      id: uuidv4(),
      fullName: fullName.trim(),
      email: normalEmail,
      phone: phone.trim(),
      juniorExperience: (juniorExperience || '').trim(),
      golfExperience: (golfExperience || '').trim(),
      returning: Boolean(returning),
      bagRoom: Boolean(bagRoom),
      availableDates,
      passwordHash,
      hours: [],
      submittedAt: new Date().toISOString(),
    };
    await addSubmission(submission);
    return res.status(200).json({ success: true, updated: false });
  } catch (e) {
    console.error('Submission error:', e);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}
