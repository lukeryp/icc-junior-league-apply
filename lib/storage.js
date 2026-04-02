import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');
const KV_KEY = 'icc_applications';

function readLocalFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Storage read error:', e);
  }
  return [];
}

function writeLocalFile(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function getSubmissions() {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    return (await kv.get(KV_KEY)) || [];
  }
  return readLocalFile();
}

export async function addSubmission(submission) {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    const existing = (await kv.get(KV_KEY)) || [];
    await kv.set(KV_KEY, [...existing, submission]);
    return;
  }
  const existing = readLocalFile();
  writeLocalFile([...existing, submission]);
}
