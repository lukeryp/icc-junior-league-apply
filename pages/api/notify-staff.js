import { getSubmissions } from '../../lib/storage';

const webpush = require('web-push');
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD;

const MAX_TITLE_LEN = 100;
const MAX_BODY_LEN = 500;

if (
  process.env.VAPID_SUBJECT &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, emails, title, body } = req.body;

  if (!MANAGER_PASSWORD) {
    console.error('MANAGER_PASSWORD env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  if (!password || password !== MANAGER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'No recipients specified' });
  }
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: 'Title and body are required' });
  }
  if (title.length > MAX_TITLE_LEN || body.length > MAX_BODY_LEN) {
    return res.status(400).json({
      error: `Title max ${MAX_TITLE_LEN} chars, body max ${MAX_BODY_LEN} chars`,
    });
  }

  try {
    const submissions = await getSubmissions();
    const emailSet = new Set(emails.map(e => e.toLowerCase().trim()));
    const targets = submissions.filter(
      s => emailSet.has(s.email?.toLowerCase?.().trim()) && s.pushSubscription
    );

    if (targets.length === 0) {
      return res.status(200).json({ sent: 0, failed: 0, noSub: emails.length });
    }

    const payload = JSON.stringify({ title: title.trim(), body: body.trim(), url: '/' });

    const results = await Promise.allSettled(
      targets.map(s => webpush.sendNotification(s.pushSubscription, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const noSub = emails.length - targets.length;

    return res.status(200).json({ sent, failed, noSub });
  } catch (e) {
    console.error('notify-staff error:', e.message);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
}
