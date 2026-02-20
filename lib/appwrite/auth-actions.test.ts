import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module
const mockSet = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
  })),
  headers: vi.fn(async () => ({
    get: vi.fn(() => "127.0.0.1"),
  })),
}));

const mockUpdatePassword = vi.fn();
const mockGetSession = vi.fn();
const mockListSessions = vi.fn();
const mockDeleteSession = vi.fn();
const mockCreateEmailPasswordSession = vi.fn();

vi.mock("node-appwrite", () => {
  class MockClient {
    setEndpoint() { return this; }
    setProject() { return this; }
    setSession() { return this; }
  }
  class MockAccount {
    updatePassword = mockUpdatePassword;
    getSession = mockGetSession;
    listSessions = mockListSessions;
    deleteSession = mockDeleteSession;
    createEmailPasswordSession = mockCreateEmailPasswordSession;
  }
  return {
    Client: MockClient,
    Account: MockAccount,
    ID: { unique: vi.fn(() => "unique-id") },
    OAuthProvider: { Google: "google", Github: "github" },
  };
});

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimitAsync: vi.fn(async () => ({ allowed: true })),
}));

vi.mock("./admin", () => ({
  createAdminClient: vi.fn(() => ({
    users: { create: vi.fn() },
    databases: { createDocument: vi.fn() },
    account: { createRecovery: vi.fn(), updateRecovery: vi.fn() },
  })),
}));

vi.mock("./collections", async (importOriginal) => {
  const original = await importOriginal<typeof import("./collections")>();
  return {
    ...original,
    setSessionCookie: vi.fn(),
  };
});

import { changePassword } from "./auth-actions";

describe("changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue({ value: "test-session-secret" });
  });

  it("returns error when no session exists", async () => {
    mockGet.mockReturnValue(undefined);

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBe("Not authenticated");
  });

  it("updates password successfully", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockResolvedValue({ $id: "current-session-id" });
    mockListSessions.mockResolvedValue({ sessions: [] });

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
    expect(mockUpdatePassword).toHaveBeenCalledWith("new-pass", "old-pass");
  });

  it("returns error on wrong current password", async () => {
    mockUpdatePassword.mockRejectedValue(
      new Error("Invalid credentials. Please check the email and password.")
    );

    const result = await changePassword("wrong-pass", "new-pass");
    expect(result.error).toContain("Invalid credentials");
  });

  it("invalidates other sessions after password change", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockResolvedValue({ $id: "current-session-id" });
    mockListSessions.mockResolvedValue({
      sessions: [
        { $id: "current-session-id" },
        { $id: "other-session-1" },
        { $id: "other-session-2" },
      ],
    });
    mockDeleteSession.mockResolvedValue({});

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
    expect(mockDeleteSession).toHaveBeenCalledTimes(2);
    expect(mockDeleteSession).toHaveBeenCalledWith("other-session-1");
    expect(mockDeleteSession).toHaveBeenCalledWith("other-session-2");
    // Should NOT delete the current session
    expect(mockDeleteSession).not.toHaveBeenCalledWith("current-session-id");
  });

  it("succeeds even if session invalidation fails", async () => {
    mockUpdatePassword.mockResolvedValue({});
    mockGetSession.mockRejectedValue(new Error("Session error"));

    const result = await changePassword("old-pass", "new-pass");
    expect(result.error).toBeUndefined();
  });
});
