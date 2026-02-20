import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockVerifyIngestRequest = vi.fn();
const mockListDocuments = vi.fn();
const mockCreateDocument = vi.fn();

vi.mock("@/lib/ingest/verify", () => ({
  verifyIngestRequest: (...args: unknown[]) => mockVerifyIngestRequest(...args),
}));

vi.mock("@/lib/appwrite/admin", () => ({
  createAdminClient: () => ({
    databases: {
      listDocuments: mockListDocuments,
      createDocument: mockCreateDocument,
    },
  }),
}));

vi.mock("@/lib/appwrite/collections", () => ({
  DATABASE_ID: "test_db",
  COLLECTIONS: {
    RAW_CAPTURES: "raw_captures",
    INGEST_NONCES: "ingest_nonces",
  },
}));

vi.mock("@/lib/appwrite/helpers", () => ({
  toJsonString: (v: unknown) => JSON.stringify(v),
}));

vi.mock("node-appwrite", () => ({
  ID: { unique: () => "test-id" },
  Query: {
    equal: (field: string, values: string[]) => `${field}=${values[0]}`,
    limit: (n: number) => `limit=${n}`,
  },
}));

import { POST } from "./route";

function makeIngestRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/ingest", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validPayload = {
  capture_id: "550e8400-e29b-41d4-a716-446655440000",
  source_feed: "twitter-tech",
  source_type: "twitter",
  captured_at: "2024-01-01T00:00:00Z",
  agent_version: "1.0.0",
  signals: [
    {
      source_type: "twitter",
      content: "test tweet",
      timestamp: "2024-01-01T00:00:00Z",
      tweet_id: "123",
      author_handle: "test",
      author_name: "Test",
      author_followers: 100,
      author_verified: false,
      likes: 10,
      retweets: 5,
      replies: 2,
      quotes: 1,
      is_thread: false,
    },
  ],
  metadata: {
    scroll_depth: 100,
    capture_duration_ms: 5000,
    total_extracted: 1,
  },
  signature: "abc123",
  timestamp: Date.now(),
  nonce: "550e8400-e29b-41d4-a716-446655440001",
};

describe("POST /api/ingest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/ingest", {
      method: "POST",
      body: "not json{{{",
      headers: { "Content-Type": "text/plain" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid JSON");
  });

  it("returns 400 on schema validation failure", async () => {
    const response = await POST(
      makeIngestRequest({ capture_id: "not-a-uuid" })
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Validation failed");
  });

  it("returns 401 on invalid HMAC signature", async () => {
    mockVerifyIngestRequest.mockResolvedValue({
      valid: false,
      error: "Invalid signature",
    });

    const response = await POST(makeIngestRequest(validPayload));
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Invalid signature");
  });

  it("returns 429 on rate limit exceeded", async () => {
    mockVerifyIngestRequest.mockResolvedValue({
      valid: false,
      error: "Rate limit exceeded — wait at least 60s between ingests",
    });

    const response = await POST(makeIngestRequest(validPayload));
    expect(response.status).toBe(429);
  });

  it("returns 200 for duplicate capture (idempotent)", async () => {
    mockVerifyIngestRequest.mockResolvedValue({ valid: true });
    mockListDocuments.mockResolvedValue({
      total: 1,
      documents: [{ $id: "existing-doc" }],
    });

    const response = await POST(makeIngestRequest(validPayload));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toContain("already ingested");
  });

  it("ingests new capture successfully", async () => {
    mockVerifyIngestRequest.mockResolvedValue({ valid: true });
    mockListDocuments.mockResolvedValue({ total: 0, documents: [] });
    mockCreateDocument.mockResolvedValue({ $id: "new-doc" });

    const response = await POST(makeIngestRequest(validPayload));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toBe("Capture ingested");
    expect(mockCreateDocument).toHaveBeenCalled();
  });
});
