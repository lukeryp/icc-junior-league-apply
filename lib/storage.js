import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');
const MANAGER_SUB_FILE = path.join(process.cwd(), 'data', 'manager_subs.json');
const KV_KEY = 'icc_applications';
const MANAGER_SUBS_KEY = 'icc_manager_push_subs';

async function redisGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  if (typeof data.result === 'string') {
    try { return JSON.parse(data.result); } catch { return data.result; }
  }
  return data.result;
}

async function redisSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('No Redis configured');
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value)),
  });
  return res.ok;
}

function hasRedis() {
  return !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
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
  if (hasRedis()) return (await redisGet(KV_KEY)) || [];
  if (process.env.NODE_ENV === 'development') return readLocalFile();
  throw new Error('No storage configured.');
}

export async function getSubmissionByEmail(email) {
  const all = await getSubmissions();
  return all.find(s => s.email === email.toLowerCase().trim()) || null;
}

export async function addSubmission(submission) {
  if (hasRedis()) {
    const existing = (await redisGet(KV_KEY)) || [];
    await redisSet(KV_KEY, [...existing, submission]);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    writeLocalFile([...readLocalFile(), submission]);
    return;
  }
  throw new Error('No storage configured.');
}

export async function updateSubmission(email, updates) {
  const normalEmail = email.toLowerCase().trim();
  if (hasRedis()) {
    const all = (await redisGet(KV_KEY)) || [];
    const idx = all.findIndex(s => s.email === normalEmail);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    await redisSet(KV_KEY, all);
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
  throw new Error('No storage configured.');
}

export async function getManagerSubscriptions() {
  if (hasRedis()) return (await redisGet(MANAGER_SUBS_KEY)) || [];
  if (process.env.NODE_ENV === 'development') {
    try { if (fs.existsSync(MANAGER_SUB_FILE)) return JSON.parse(fs.readFileSync(MANAGER_SUB_FILE, 'utf8')); }
    catch (e) {}
    return [];
  }
  throw new Error('No storage configured.');
}

export async function addManagerSubscription(subscription) {
  const endpoint = subscription.endpoint;
  if (hasRedis()) {
    const existing = (await redisGet(MANAGER_SUBS_KEY)) || [];
    const deduped = existing.filter(s => s.endpoint !== endpoint);
    await redisSet(MANAGER_SUBS_KEY, [...deduped, subscription]);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    const dir = path.dirname(MANAGER_SUB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing = [];
    try { if (fs.existsSync(MANAGER_SUB_FILE)) existing = JSON.parse(fs.readFileSync(MANAGER_SUB_FILE, 'utf8')); } catch {}
    const deduped = existing.filter(s => s.endpoint !== endpoint);
    fs.writeFileSync(MANAGER_SUB_FILE, JSON.stringify([...deduped, subscription], null, 2));
    return;
  }
  throw new Error('No storage configured.');
}
