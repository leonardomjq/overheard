import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockListDocuments = vi.fn();
const mockDeleteDocument = vi.fn();
const mockUpdateDocument = vi.fn();

vi.mock("@/lib/appwrite/admin", () => ({
  createAdminClient: () => ({
    databases: {
      listDocuments: mockListDocuments,
      deleteDocument: mockDeleteDocument,
      updateDocument: mockUpdateDocument,
    },
  }),
}));

vi.mock("@/lib/appwrite/collections", () => ({
  DATABASE_ID: "test_db",
  COLLECTIONS: {
    INGEST_NONCES: "ingest_nonces",
    ALPHA_CARDS: "alpha_cards",
  },
}));

vi.mock("@/lib/refinery/freshness", () => ({
  computeFreshness: vi.fn(() => ({ status: "warm", score: 0.6 })),
}));

import { POST } from "./route";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/cron/cleanup", {
    method: "POST",
    headers,
  });
}

describe("POST /api/cron/cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PIPELINE_BEARER_TOKEN = "test-bearer-token";
    process.env.CRON_SECRET = "test-cron-secret";
  });

  it("returns 401 without valid auth", async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
  });

  it("accepts bearer token auth", async () => {
    mockListDocuments.mockResolvedValue({ documents: [], total: 0 });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-bearer-token" })
    );
    expect(response.status).toBe(200);
  });

  it("accepts cron secret auth", async () => {
    mockListDocuments.mockResolvedValue({ documents: [], total: 0 });

    const response = await POST(
      makeRequest({ "x-cron-secret": "test-cron-secret" })
    );
    expect(response.status).toBe(200);
  });

  it("deletes expired nonces and updates card freshness", async () => {
    // First call: nonces (returns 1 expired nonce)
    // Second call: cards (returns 1 card)
    mockListDocuments
      .mockResolvedValueOnce({
        documents: [{ $id: "nonce-1", $createdAt: "2020-01-01T00:00:00Z" }],
        total: 1,
      })
      .mockResolvedValueOnce({
        documents: [
          {
            $id: "card-1",
            $createdAt: "2024-01-01T00:00:00Z",
            status: "fresh",
            freshness_score: 0.9,
          },
        ],
        total: 1,
      });

    mockDeleteDocument.mockResolvedValue({});
    mockUpdateDocument.mockResolvedValue({});

    const response = await POST(
      makeRequest({ authorization: "Bearer test-bearer-token" })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.nonces_deleted).toBe(1);
    expect(data.cards_updated).toBe(1);
  });

  it("returns 500 on database error", async () => {
    mockListDocuments.mockRejectedValue(new Error("DB error"));

    const response = await POST(
      makeRequest({ authorization: "Bearer test-bearer-token" })
    );
    expect(response.status).toBe(500);
  });
});
