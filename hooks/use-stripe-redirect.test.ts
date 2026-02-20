import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockToast = vi.fn();

vi.mock("@/components/toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { useStripeRedirect } from "./use-stripe-redirect";

describe("useStripeRedirect", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("starts with loading=false and error=null", () => {
    const { result } = renderHook(() =>
      useStripeRedirect("/api/stripe/portal")
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("redirects to URL on successful response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 200,
      json: async () => ({ url: "https://stripe.com/checkout" }),
    } as Response);

    const { result } = renderHook(() =>
      useStripeRedirect("/api/stripe/checkout")
    );

    await act(async () => {
      await result.current.redirect();
    });

    expect(window.location.href).toBe("https://stripe.com/checkout");
  });

  it("redirects to /login on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    } as Response);

    const { result } = renderHook(() =>
      useStripeRedirect("/api/stripe/portal")
    );

    await act(async () => {
      await result.current.redirect();
    });

    expect(window.location.href).toBe("/login");
  });

  it("shows error toast when no URL returned", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 200,
      json: async () => ({ error: "No session" }),
    } as Response);

    const { result } = renderHook(() =>
      useStripeRedirect("/api/stripe/portal", "Portal error")
    );

    await act(async () => {
      await result.current.redirect();
    });

    expect(result.current.error).toBe("Portal error");
    expect(mockToast).toHaveBeenCalledWith("Portal error", "error");
    expect(result.current.loading).toBe(false);
  });

  it("shows error toast on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useStripeRedirect("/api/stripe/portal", "Network failed")
    );

    await act(async () => {
      await result.current.redirect();
    });

    expect(result.current.error).toBe("Network failed");
    expect(mockToast).toHaveBeenCalledWith("Network failed", "error");
    expect(result.current.loading).toBe(false);
  });
});
