import { kv } from "@vercel/kv";

interface SubscriberRecord {
  email: string;
  subscribed_at: string;
}

const hasKV = Boolean(process.env.KV_REST_API_URL);

// In-memory fallback for local dev (no Redis needed)
const memStore = new Map<string, unknown>();
let warnedOnce = false;

function warnFallback() {
  if (!warnedOnce) {
    console.warn("[kv] KV_REST_API_URL not set — using in-memory fallback");
    warnedOnce = true;
  }
}

export async function getSubscriber(
  email: string,
): Promise<SubscriberRecord | null> {
  const key = `subscriber:${email}`;

  if (!hasKV) {
    warnFallback();
    return (memStore.get(key) as SubscriberRecord) ?? null;
  }

  return kv.get<SubscriberRecord>(key);
}

export async function setSubscriber(email: string): Promise<void> {
  const key = `subscriber:${email}`;
  const record: SubscriberRecord = {
    email,
    subscribed_at: new Date().toISOString(),
  };

  if (!hasKV) {
    warnFallback();
    memStore.set(key, record);
    return;
  }

  await kv.set(key, record);
}

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60; // seconds

export async function checkRateLimit(ip: string): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW);
  const key = `ratelimit:${ip}:${bucket}`;

  if (!hasKV) {
    warnFallback();
    const count = (memStore.get(key) as number) ?? 0;
    memStore.set(key, count + 1);
    return count < RATE_LIMIT_MAX;
  }

  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, RATE_LIMIT_WINDOW);
  }
  return count <= RATE_LIMIT_MAX;
}
