import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');
const KV_KEY = 'icc_applications';

// Detect which Redis client to use:
// 1. Upstash Redis (via Vercel Upstash integration) — UPSTASH_REDIS_REST_URL
// 2. Legacy @vercel/kv — KV_REST_API_URL
// 3. Local file (dev only)

function getRedisClient() {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { Redis } = require('@upstash/redis');
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  if (process.env.KV_REST_API_URL) {
    const { Redis } = require('@upstash/redis');
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
}

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
  const redis = getRedisClient();
  if (redis) {
    return (await redis.get(KV_KEY)) || [];
  }
  if (process.env.NODE_ENV === 'development') {
    return readLocalFile();
  }
  throw new Error('No Redis storage configured. Add Upstash Redis via Vercel Marketplace and set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.');
}

export async function addSubmission(submission) {
  const redis = getRedisClient();
  if (redis) {
    const existing = (await redis.get(KV_KEY)) || [];
    await redis.set(KV_KEY, [...existing, submission]);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    const existing = readLocalFile();
    writeLocalFile([...existing, submission]);
    return;
  }
  throw new Error('No Redis storage configured. Add Upstash Redis via Vercel Marketplace and set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.');
}
