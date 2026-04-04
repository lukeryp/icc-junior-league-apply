import { deleteSession } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionToken } = req.body;
  if (sessionToken) await deleteSession(sessionToken).catch(() => {});
  return res.status(200).json({ success: true });
}
