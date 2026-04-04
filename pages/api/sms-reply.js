// Twilio webhook — handles staff replying Y or N to reminder SMS
// Note: For production hardening, add Twilio request signature validation
// using twilio.validateRequest() before this handler processes the body.

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { Body } = req.body;
  const reply = (Body || '').trim().toUpperCase();
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icc-junior-league-apply.vercel.app';

  let responseText;
  if (reply === 'Y' || reply === 'YES') {
    responseText = "Got it! \u2705 You're confirmed. See you at Meadowbrook! To view or update your schedule anytime: " + portalUrl + "/portal";
  } else if (reply === 'N' || reply === 'NO') {
    responseText = "No problem! Please log in to update your available dates: " + portalUrl + "/portal \u2014 We'll work around your schedule.";
  } else {
    responseText = "Hi! Reply Y to confirm your availability or N if you need to update it. Or visit: " + portalUrl + "/portal";
  }

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(responseText)}</Message></Response>`
  );
}
