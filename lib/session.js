import crypto from 'crypto';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_KEY_PREFIX = 'ses:';

// Dev-only in-memory store (module-level, lives for the process lifetime)
const devSessions = new Map();

function hasRedis() {
  return !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
}

async function redisGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  if (!data.result) return null;
  // Handle Upstash double-encoding quirk
  let val = data.result;
  for (let i = 0; i < 3 && typeof val === 'string'; i++) {
    try { val = JSON.parse(val); } catch { break; }
  }
  return val;
}

async function redisSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
    signal: AbortSignal.timeout(5000),
  });
}

async function redisDel(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
}

export async function createSession(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const data = { email: email.toLowerCase().trim(), expires: Date.now() + SESSION_TTL_MS };
  if (hasRedis()) {
    await redisSet(SESSION_KEY_PREFIX + token, data);
  } else if (process.env.NODE_ENV === 'development') {
    devSessions.set(token, data);
  }
  return token;
}

export async function verifySession(token) {
  // Reject malformed tokens immediately
  if (!token || typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return null;

  let data;
  if (hasRedis()) {
    data = await redisGet(SESSION_KEY_PREFIX + token);
  } else if (process.env.NODE_ENV === 'development') {
    data = devSessions.get(token) || null;
  }

  if (!data || !data.email || !data.expires) return null;
  if (Date.now() > data.expires) {
    // Lazily delete expired session
    if (hasRedis()) redisDel(SESSION_KEY_PREFIX + token).catch(() => {});
    else devSessions.delete(token);
    return null;
  }
  return data.email;
}

export async function deleteSession(token) {
  if (!token || typeof token !== 'string') return;
  if (hasRedis()) {
    await redisDel(SESSION_KEY_PREFIX + token);
  } else if (process.env.NODE_ENV === 'development') {
    devSessions.delete(token);
  }
}
