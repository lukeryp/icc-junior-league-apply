import { getSubmissions } from '../../../lib/storage';
const twilio = require('twilio');
const webpush = require('web-push');

const TUESDAYS = [
  '2026-06-02','2026-06-09','2026-06-16','2026-06-23','2026-06-30',
  '2026-07-07','2026-07-14','2026-07-21','2026-07-28',
  '2026-08-04','2026-08-11',
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr + 'T12:00:00');
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}
function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return '+' + digits;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== 'Bearer ' + process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icc-junior-league-apply.vercel.app';
  const targets = TUESDAYS.filter(d => { const days = daysUntil(d); return days === 7 || days === 2; });

  if (targets.length === 0) return res.status(200).json({ sent: 0, message: 'No reminders due today' });

  // Twilio
  const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

  // Web Push
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails('mailto:luke@rypgolf.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  }

  const submissions = await getSubmissions();
  const results = [];

  for (const dateStr of targets) {
    const days = daysUntil(dateStr);
    const label = formatDate(dateStr);
    const staff = submissions.filter(s => s.availableDates && s.availableDates.includes(dateStr));

    for (const person of staff) {
      const firstName = person.fullName.split(' ')[0];

      // SMS
      if (twilioClient) {
        const smsBody = days === 7
          ? \`Have you updated your ICC Junior Golf at Meadowbrook availability? Reply Y to confirm you're still good for \${label}, or N if not. Update your schedule: \${portalUrl}/portal\`
          : \`Reminder: ICC Junior Golf at Meadowbrook is in 2 days (\${label})! Still available? Reply Y to confirm or N if plans changed. \${portalUrl}/portal\`;
        try {
          await twilioClient.messages.create({ body: smsBody, from: process.env.TWILIO_PHONE_NUMBER, to: formatPhone(person.phone) });
          results.push({ name: person.fullName, type: 'sms', status: 'sent' });
        } catch (err) {
          results.push({ name: person.fullName, type: 'sms', status: 'failed', error: err.message });
        }
      }

      // Web push
      if (person.pushSubscription && process.env.VAPID_PUBLIC_KEY) {
        const pushPayload = JSON.stringify({
          title: 'ICC Junior Golf — Availability Check',
          body: days === 7
            ? \`Have you updated your Meadowbrook availability for \${label}?\`
            : \`Reminder: Meadowbrook is in 2 days (\${label}). Tap to update.\`,
          url: portalUrl + '/portal',
        });
        try {
          await webpush.sendNotification(person.pushSubscription, pushPayload);
          results.push({ name: person.fullName, type: 'push', status: 'sent' });
        } catch (err) {
          results.push({ name: person.fullName, type: 'push', status: 'failed', error: err.message });
        }
      }
    }
  }

  return res.status(200).json({ sent: results.filter(r => r.status === 'sent').length, results });
}
