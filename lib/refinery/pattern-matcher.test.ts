import { describe, it, expect } from "vitest";
import {
  computeMomentum,
  determineMomentumDirection,
  runPatternMatcher,
} from "./pattern-matcher";
import type { ScrubberOutput } from "@/types";

describe("computeMomentum", () => {
  it("computes momentum from velocity, friction, and author weight", () => {
    const score = computeMomentum(2, 0.5, 3);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("caps momentum at 100", () => {
    const score = computeMomentum(100, 1, 100);
    expect(score).toBe(100);
  });

  it("handles zero friction density gracefully", () => {
    const score = computeMomentum(5, 0, 3);
    // Uses min(0.01) fallback for sqrt
    expect(score).toBeGreaterThan(0);
  });

  it("returns low score for low inputs", () => {
    const score = computeMomentum(0.1, 0.1, 1);
    expect(score).toBeLessThan(10);
  });
});

describe("determineMomentumDirection", () => {
  it("returns rising for positive delta above threshold", () => {
    expect(determineMomentumDirection(60, 50)).toBe("rising");
  });

  it("returns falling for negative delta below threshold", () => {
    expect(determineMomentumDirection(40, 50)).toBe("falling");
  });

  it("returns stable for small delta", () => {
    expect(determineMomentumDirection(52, 50)).toBe("stable");
  });

  it("returns rising for first observation (null previous)", () => {
    expect(determineMomentumDirection(50, null)).toBe("rising");
  });

  it("returns stable at exact boundary (delta = 5)", () => {
    expect(determineMomentumDirection(55, 50)).toBe("stable");
  });

  it("returns rising just above boundary (delta > 5)", () => {
    expect(determineMomentumDirection(55.1, 50)).toBe("rising");
  });
});

describe("runPatternMatcher", () => {
  const makeScrubberOutput = (overrides: Partial<ScrubberOutput> = {}): ScrubberOutput => ({
    capture_id: "550e8400-e29b-41d4-a716-446655440000",
    processed_at: new Date().toISOString(),
    total_input: 10,
    total_passed: 8,
    entities: [
      { name: "React", category: "framework", sentiment: "negative", friction_signal: true, mentions: 5 },
      { name: "Svelte", category: "framework", sentiment: "positive", friction_signal: true, mentions: 4 },
    ],
    friction_points: [
      {
        entity: "React",
        signal: "State management complexity",
        source_tweet_ids: ["t1", "t2", "t3"],
        severity: "high",
      },
      {
        entity: "Svelte",
        signal: "Migration effort from React",
        source_tweet_ids: ["t1", "t2", "t3"],
        severity: "medium",
      },
    ],
    notable_tweets: [
      { tweet_id: "t1", relevance_score: 0.9, extracted_insight: "React to Svelte migration" },
      { tweet_id: "t2", relevance_score: 0.8, extracted_insight: "React performance issues" },
      { tweet_id: "t3", relevance_score: 0.7, extracted_insight: "Svelte adoption growing" },
    ],
    ...overrides,
  });

  it("finds clusters from co-occurring entities", async () => {
    const outputs = [makeScrubberOutput(), makeScrubberOutput()];
    const result = await runPatternMatcher(outputs);
    expect(result.totalFound).toBeGreaterThanOrEqual(0);
    expect(result.clusters).toBeDefined();
  });

  it("returns empty clusters for empty input", async () => {
    const result = await runPatternMatcher([]);
    expect(result.totalFound).toBe(0);
    expect(result.clusters).toEqual([]);
    expect(result.qualifyingClusters).toEqual([]);
  });

  it("filters clusters below momentum threshold", async () => {
    const output = makeScrubberOutput({
      entities: [
        { name: "ObscureTool", category: "tool", sentiment: "neutral", friction_signal: false, mentions: 1 },
        { name: "RareLang", category: "language", sentiment: "neutral", friction_signal: false, mentions: 1 },
      ],
      friction_points: [],
      notable_tweets: [],
    });
    const result = await runPatternMatcher([output]);
    // Low mentions = low momentum = filtered out
    expect(result.qualifyingClusters.length).toBe(0);
  });

  it("computes momentum delta from previous clusters", async () => {
    const outputs = [makeScrubberOutput()];
    const previousClusters = [
      {
        cluster_id: "prev-cluster-1",
        entities: ["react", "svelte"],
        momentum_score: 30,
        momentum_delta: 0,
        direction: "stable" as const,
        evidence_tweet_ids: ["old-t1"],
        friction_density: 0.3,
        first_seen: "2025-01-14T00:00:00Z",
        window_hours: 48,
      },
    ];
    const result = await runPatternMatcher(outputs, previousClusters);
    // All clusters should have computed delta relative to previous
    for (const cluster of result.clusters) {
      expect(typeof cluster.momentum_delta).toBe("number");
    }
  });
});
