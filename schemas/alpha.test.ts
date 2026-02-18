import { describe, it, expect } from "vitest";
import { AlphaCardSchema } from "./alpha";
import strategistResponse from "@/__fixtures__/strategist-response.json";

const validCard = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  created_at: "2025-01-15T12:00:00Z",
  expires_at: "2025-01-18T12:00:00Z",
  status: "active" as const,
  cluster_id: "660e8400-e29b-41d4-a716-446655440000",
  ...strategistResponse,
};

describe("AlphaCardSchema", () => {
  it("validates a full alpha card", () => {
    expect(() => AlphaCardSchema.parse(validCard)).not.toThrow();
  });

  it("validates a card with null pro fields (free tier)", () => {
    const freeCard = {
      ...validCard,
      thesis: null,
      strategy: null,
      risk_factors: null,
      evidence: null,
      friction_detail: null,
      opportunity_window: null,
      blueprint: null,
    };
    expect(() => AlphaCardSchema.parse(freeCard)).not.toThrow();
  });

  it("validates a complete blueprint", () => {
    expect(validCard.blueprint).not.toBeNull();
    const result = AlphaCardSchema.parse(validCard);
    expect(result.blueprint).toBeDefined();
    expect(result.blueprint!.name_ideas.length).toBeGreaterThan(0);
    expect(result.blueprint!.mvp_weeks.length).toBeGreaterThan(0);
  });

  it("rejects blueprint with empty name_ideas", () => {
    const bad = {
      ...validCard,
      blueprint: { ...validCard.blueprint, name_ideas: [] },
    };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects invalid category", () => {
    const bad = { ...validCard, category: "invalid" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects momentum_score below 0", () => {
    const bad = { ...validCard, momentum_score: -1 };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects momentum_score above 100", () => {
    const bad = { ...validCard, momentum_score: 101 };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects invalid status", () => {
    const bad = { ...validCard, status: "deleted" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects invalid direction", () => {
    const bad = { ...validCard, direction: "sideways" };
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("rejects missing required fields", () => {
    const { title, ...bad } = validCard;
    expect(() => AlphaCardSchema.parse(bad)).toThrow();
  });

  it("validates all valid categories", () => {
    const categories = [
      "momentum_shift",
      "friction_opportunity",
      "emerging_tool",
      "contrarian_signal",
    ];
    for (const category of categories) {
      expect(() =>
        AlphaCardSchema.parse({ ...validCard, category })
      ).not.toThrow();
    }
  });
});
