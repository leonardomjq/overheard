import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock Upstash to avoid real connections
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true }),
  })),
}));

import { checkRateLimit, checkRateLimitAsync, _resetStore } from "./rate-limit";

describe("checkRateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    _resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within limit", () => {
    expect(checkRateLimit("test", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test", 3, 60_000).allowed).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test", 5, 60_000);
    }
    expect(checkRateLimit("test", 5, 60_000).allowed).toBe(false);
  });

  it("allows again after window expires", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("test", 3, 60_000);
    }
    expect(checkRateLimit("test", 3, 60_000).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit("test", 3, 60_000).allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("key-a", 3, 60_000);
    }
    expect(checkRateLimit("key-a", 3, 60_000).allowed).toBe(false);
    expect(checkRateLimit("key-b", 3, 60_000).allowed).toBe(true);
  });

  it("cleans up stale entries during lazy cleanup", () => {
    checkRateLimit("old-key", 5, 60_000);

    // Advance past the max window (1h) + cleanup interval (10min)
    vi.advanceTimersByTime(70 * 60 * 1000 + 1);

    // Trigger cleanup by calling checkRateLimit
    checkRateLimit("trigger", 5, 60_000);

    // old-key should have been pruned — next call should be allowed as fresh
    expect(checkRateLimit("old-key", 1, 60_000).allowed).toBe(true);
  });

  it("_resetStore clears all state", () => {
    checkRateLimit("test", 1, 60_000);
    expect(checkRateLimit("test", 1, 60_000).allowed).toBe(false);

    _resetStore();

    expect(checkRateLimit("test", 1, 60_000).allowed).toBe(true);
  });
});

describe("checkRateLimitAsync (in-memory fallback without Upstash env)", () => {
  beforeEach(() => {
    _resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within limit", async () => {
    const r1 = await checkRateLimitAsync("async-test", 2, 60_000);
    expect(r1.allowed).toBe(true);

    const r2 = await checkRateLimitAsync("async-test", 2, 60_000);
    expect(r2.allowed).toBe(true);
  });

  it("blocks requests exceeding limit", async () => {
    await checkRateLimitAsync("async-test", 1, 60_000);
    const result = await checkRateLimitAsync("async-test", 1, 60_000);
    expect(result.allowed).toBe(false);
  });
});
