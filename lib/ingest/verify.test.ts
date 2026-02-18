import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeHmac, verifySignature, verifyTimestamp } from "./verify";

describe("computeHmac", () => {
  it("produces consistent HMAC for same input", () => {
    const hmac1 = computeHmac("test payload", "secret");
    const hmac2 = computeHmac("test payload", "secret");
    expect(hmac1).toBe(hmac2);
  });

  it("produces different HMAC for different payloads", () => {
    const hmac1 = computeHmac("payload1", "secret");
    const hmac2 = computeHmac("payload2", "secret");
    expect(hmac1).not.toBe(hmac2);
  });

  it("produces different HMAC for different secrets", () => {
    const hmac1 = computeHmac("payload", "secret1");
    const hmac2 = computeHmac("payload", "secret2");
    expect(hmac1).not.toBe(hmac2);
  });

  it("returns a hex string", () => {
    const hmac = computeHmac("test", "secret");
    expect(hmac).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifySignature", () => {
  const secret = "test-secret-key-min-32-characters!";
  const payload = '{"test":"data"}';

  it("accepts valid signature", () => {
    const sig = computeHmac(payload, secret);
    expect(verifySignature(payload, sig, secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    expect(verifySignature(payload, "invalid", secret)).toBe(false);
  });

  it("rejects tampered payload", () => {
    const sig = computeHmac(payload, secret);
    expect(verifySignature('{"test":"tampered"}', sig, secret)).toBe(false);
  });

  it("rejects wrong secret", () => {
    const sig = computeHmac(payload, secret);
    expect(verifySignature(payload, sig, "wrong-secret")).toBe(false);
  });

  it("rejects non-hex signature gracefully", () => {
    expect(verifySignature(payload, "not-hex-at-all!", secret)).toBe(false);
  });
});

describe("verifyTimestamp", () => {
  it("accepts current timestamp", () => {
    expect(verifyTimestamp(Date.now())).toBe(true);
  });

  it("accepts timestamp within 5 minutes", () => {
    const fourMinutesAgo = Date.now() - 4 * 60 * 1000;
    expect(verifyTimestamp(fourMinutesAgo)).toBe(true);
  });

  it("rejects timestamp older than 5 minutes", () => {
    const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
    expect(verifyTimestamp(sixMinutesAgo)).toBe(false);
  });

  it("rejects timestamp far in the future", () => {
    const tenMinutesFromNow = Date.now() + 10 * 60 * 1000;
    expect(verifyTimestamp(tenMinutesFromNow)).toBe(false);
  });

  it("accepts timestamp at exact boundary", () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(verifyTimestamp(fiveMinutesAgo)).toBe(true);
  });
});
