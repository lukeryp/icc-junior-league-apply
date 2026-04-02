import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');
const MANAGER_SUB_FILE = path.join(process.cwd(), 'data', 'manager_subs.json');
const KV_KEY = 'icc_applications';
const MANAGER_SUBS_KEY = 'icc_manager_push_subs';

function getRedisClient() {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { Redis } = require('@upstash/redis');
    return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  }
  if (process.env.KV_REST_API_URL) {
    const { Redis } = require('@upstash/redis');
    return new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
  }
  return null;
}

function readLocalFile() {
  try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { console.error('Storage read error:', e); }
  return [];
}

function writeLocalFile(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function getSubmissions() {
  const redis = getRedisClient();
  if (redis) return (await redis.get(KV_KEY)) || [];
  if (process.env.NODE_ENV === 'development') return readLocalFile();
  throw new Error('No Redis storage configured.');
}

export async function getSubmissionByEmail(email) {
  const all = await getSubmissions();
  return all.find(s => s.email === email.toLowerCase().trim()) || null;
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
  throw new Error('No Redis storage configured.');
}

export async function updateSubmission(email, updates) {
  const redis = getRedisClient();
  const normalEmail = email.toLowerCase().trim();
  if (redis) {
    const all = (await redis.get(KV_KEY)) || [];
    const idx = all.findIndex(s => s.email === normalEmail);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    await redis.set(KV_KEY, all);
    return true;
  }
  if (process.env.NODE_ENV === 'development') {
    const all = readLocalFile();
    const idx = all.findIndex(s => s.email === normalEmail);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalFile(all);
    return true;
  }
  throw new Error('No Redis storage configured.');
}

// ── Manager push subscriptions ───────────────────────────────────────────────

export async function getManagerSubscriptions() {
  const redis = getRedisClient();
  if (redis) return (await redis.get(MANAGER_SUBS_KEY)) || [];
  if (process.env.NODE_ENV === 'development') {
    try { if (fs.existsSync(MANAGER_SUB_FILE)) return JSON.parse(fs.readFileSync(MANAGER_SUB_FILE, 'utf8')); }
    catch (e) { console.error('Manager sub read error:', e); }
    return [];
  }
  throw new Error('No Redis storage configured.');
}

export async function addManagerSubscription(subscription) {
  const redis = getRedisClient();
  // Use endpoint as unique key to avoid duplicates
  const endpoint = subscription.endpoint;
  if (redis) {
    const existing = (await redis.get(MANAGER_SUBS_KEY)) || [];
    const deduped = existing.filter(s => s.endpoint !== endpoint);
    await redis.set(MANAGER_SUBS_KEY, [...deduped, subscription]);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    const dir = path.dirname(MANAGER_SUB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing = [];
    try { if (fs.existsSync(MANAGER_SUB_FILE)) existing = JSON.parse(fs.readFileSync(MANAGER_SUB_FILE, 'utf8')); }
    catch (e) {}
    const deduped = existing.filter(s => s.endpoint !== endpoint);
    fs.writeFileSync(MANAGER_SUB_FILE, JSON.stringify([...deduped, subscription], null, 2));
    return;
  }
  throw new Error('No Redis storage configured.');
}
