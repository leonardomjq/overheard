import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes
const MIN_INGEST_INTERVAL_MS = 60 * 1000; // 60 seconds

interface VerifyResult {
  valid: boolean;
  error?: string;
}

export function computeHmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = computeHmac(payload, secret);
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

export function verifyTimestamp(timestampMs: number): boolean {
  const now = Date.now();
  const age = Math.abs(now - timestampMs);
  return age <= MAX_TIMESTAMP_AGE_MS;
}

export async function verifyNonce(nonce: string): Promise<boolean> {
  const supabase = createAdminClient();

  // Try to insert — if it already exists, it's a replay
  const { error } = await supabase.from("ingest_nonces").insert({ nonce });

  if (error) {
    // Unique constraint violation = duplicate nonce
    if (error.code === "23505") return false;
    throw new Error(`Nonce check failed: ${error.message}`);
  }

  return true;
}

export async function verifyRateLimit(sourceFeed: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("raw_captures")
    .select("created_at")
    .eq("source_feed", sourceFeed)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return true;

  const lastIngest = new Date(data[0].created_at).getTime();
  return Date.now() - lastIngest >= MIN_INGEST_INTERVAL_MS;
}

export async function verifyIngestRequest(
  rawBody: string,
  signature: string,
  timestampMs: number,
  nonce: string,
  sourceFeed: string
): Promise<VerifyResult> {
  const secret = process.env.INGEST_HMAC_SECRET;
  if (!secret) return { valid: false, error: "HMAC secret not configured" };

  // 1. Verify HMAC signature
  if (!verifySignature(rawBody, signature, secret)) {
    return { valid: false, error: "Invalid signature" };
  }

  // 2. Verify timestamp freshness
  if (!verifyTimestamp(timestampMs)) {
    return { valid: false, error: "Timestamp too old or too far in the future" };
  }

  // 3. Verify nonce uniqueness
  const nonceValid = await verifyNonce(nonce);
  if (!nonceValid) {
    return { valid: false, error: "Duplicate nonce — possible replay attack" };
  }

  // 4. Rate limit check
  const rateOk = await verifyRateLimit(sourceFeed);
  if (!rateOk) {
    return { valid: false, error: "Rate limit exceeded — wait at least 60s between ingests" };
  }

  return { valid: true };
}
