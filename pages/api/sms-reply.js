// Twilio webhook — handles staff replying Y or N to reminder SMS
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { Body, From } = req.body;
  const reply = (Body || '').trim().toUpperCase();
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://icc-junior-league-apply.vercel.app';

  let responseText;
  if (reply === 'Y' || reply === 'YES') {
    responseText = "Got it! ✅ You're confirmed. See you at Meadowbrook! To view or update your schedule anytime: " + portalUrl + "/portal";
  } else if (reply === 'N' || reply === 'NO') {
    responseText = "No problem! Please log in to update your available dates: " + portalUrl + "/portal — We'll work around your schedule.";
  } else {
    responseText = "Hi! Reply Y to confirm your availability or N if you need to update it. Or visit: " + portalUrl + "/portal";
  }

  // Respond with TwiML
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${responseText}</Message></Response>`);
}
