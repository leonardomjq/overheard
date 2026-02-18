import { describe, it, expect } from "vitest";
import { gateAlphaCard } from "./gate";
import type { AlphaCard } from "@/types";

const fullCard: AlphaCard = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  created_at: "2025-01-15T12:00:00Z",
  expires_at: "2025-01-18T12:00:00Z",
  status: "active",
  title: "K8s Exodus: Simplification Wave",
  category: "friction_opportunity",
  entities: ["kubernetes", "docker", "kamal"],
  momentum_score: 72,
  direction: "rising",
  signal_count: 5,
  thesis: "Teams migrating away from K8s",
  strategy: "Build deployment simplification tools",
  risk_factors: ["Enterprise resistance", "K8s DX improvements"],
  evidence: [
    { tweet_id: "t1", author: "cloudarch", snippet: "Replaced K8s", relevance: 0.95 },
  ],
  friction_detail: "Operational complexity and cost overhead",
  opportunity_window: "6-12 months",
  blueprint: {
    product_concept: "A CLI tool that converts K8s YAML to Docker Compose",
    name_ideas: ["KubeEject", "SimpleDeploy"],
    mvp_weeks: [
      { week: 1, goal: "Core parser", tasks: ["Build YAML parser", "Map resources"] },
    ],
    monetization: "Freemium: CLI free, Pro $29/mo for teams",
    tech_stack: ["TypeScript", "Node.js"],
    estimated_tam: "~50K teams, $870K ARR addressable",
  },
  cluster_id: "660e8400-e29b-41d4-a716-446655440000",
};

describe("gateAlphaCard", () => {
  it("returns full card for pro tier", () => {
    const result = gateAlphaCard(fullCard, "pro");
    expect(result.thesis).toBe(fullCard.thesis);
    expect(result.strategy).toBe(fullCard.strategy);
    expect(result.risk_factors).toEqual(fullCard.risk_factors);
    expect(result.evidence).toEqual(fullCard.evidence);
    expect(result.friction_detail).toBe(fullCard.friction_detail);
    expect(result.opportunity_window).toBe(fullCard.opportunity_window);
    expect(result.blueprint).toEqual(fullCard.blueprint);
  });

  it("nullifies pro fields for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.thesis).toBeNull();
    expect(result.strategy).toBeNull();
    expect(result.risk_factors).toBeNull();
    expect(result.evidence).toBeNull();
    expect(result.friction_detail).toBeNull();
    expect(result.opportunity_window).toBeNull();
    expect(result.blueprint).toBeNull();
  });

  it("preserves free tier fields for free tier", () => {
    const result = gateAlphaCard(fullCard, "free");
    expect(result.id).toBe(fullCard.id);
    expect(result.title).toBe(fullCard.title);
    expect(result.category).toBe(fullCard.category);
    expect(result.entities).toEqual(fullCard.entities);
    expect(result.momentum_score).toBe(fullCard.momentum_score);
    expect(result.direction).toBe(fullCard.direction);
    expect(result.signal_count).toBe(fullCard.signal_count);
    expect(result.cluster_id).toBe(fullCard.cluster_id);
  });

  it("does not mutate the original card", () => {
    const original = { ...fullCard };
    gateAlphaCard(fullCard, "free");
    expect(fullCard.thesis).toBe(original.thesis);
    expect(fullCard.strategy).toBe(original.strategy);
  });

  it("handles card already having null pro fields", () => {
    const nulledCard: AlphaCard = {
      ...fullCard,
      thesis: null,
      strategy: null,
      risk_factors: null,
      evidence: null,
      friction_detail: null,
      opportunity_window: null,
      blueprint: null,
    };
    const result = gateAlphaCard(nulledCard, "free");
    expect(result.thesis).toBeNull();
    expect(result.title).toBe(fullCard.title);
  });
});
