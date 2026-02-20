import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockAccountGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockGet,
    delete: mockDelete,
  })),
}));

vi.mock("node-appwrite", () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setSession() { return this; }
  }
  class MockAccount {
    get = mockAccountGet;
  }
  class MockDatabases {}
  return {
    Client: MockClient,
    Account: MockAccount,
    Databases: MockDatabases,
  };
});

// React cache is a no-op in test — just call the function directly
vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

import { createSessionClient, getLoggedInUser } from "./server";

describe("createSessionClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns account and databases when session exists", async () => {
    mockGet.mockReturnValue({ value: "valid-session" });

    const client = await createSessionClient();
    expect(client).toHaveProperty("account");
    expect(client).toHaveProperty("databases");
  });

  it("throws when no session cookie exists", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(createSessionClient()).rejects.toThrow("No session");
  });
});

describe("getLoggedInUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when session is valid", async () => {
    mockGet.mockReturnValue({ value: "valid-session" });
    mockAccountGet.mockResolvedValue({
      $id: "user-123",
      email: "test@example.com",
    });

    const user = await getLoggedInUser();
    expect(user).toEqual({ $id: "user-123", email: "test@example.com" });
  });

  it("returns null when no session exists", async () => {
    mockGet.mockReturnValue(undefined);

    const user = await getLoggedInUser();
    expect(user).toBeNull();
  });

  it("cleans up stale cookie when Appwrite rejects session", async () => {
    mockGet.mockReturnValue({ value: "expired-session" });
    mockAccountGet.mockRejectedValue(new Error("Session expired"));

    const user = await getLoggedInUser();
    expect(user).toBeNull();
    expect(mockDelete).toHaveBeenCalledWith("scout_session");
  });
});
