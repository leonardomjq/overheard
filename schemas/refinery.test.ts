import { describe, it, expect } from "vitest";
import {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
  PatternClusterSchema,
} from "./refinery";

describe("TechEntitySchema", () => {
  it("validates a correct entity", () => {
    const entity = {
      name: "React",
      category: "framework",
      sentiment: "positive",
      friction_signal: false,
      mentions: 5,
    };
    expect(() => TechEntitySchema.parse(entity)).not.toThrow();
  });

  it("rejects invalid category", () => {
    const bad = {
      name: "React",
      category: "invalid_category",
      sentiment: "positive",
      friction_signal: false,
      mentions: 5,
    };
    expect(() => TechEntitySchema.parse(bad)).toThrow();
  });

  it("rejects negative mentions", () => {
    const bad = {
      name: "React",
      category: "framework",
      sentiment: "positive",
      friction_signal: false,
      mentions: -1,
    };
    expect(() => TechEntitySchema.parse(bad)).toThrow();
  });
});

describe("FrictionPointSchema", () => {
  it("validates a correct friction point", () => {
    const fp = {
      entity: "Webpack",
      signal: "Custom loader migration issues",
      source_tweet_ids: ["t1", "t2"],
      severity: "high",
    };
    expect(() => FrictionPointSchema.parse(fp)).not.toThrow();
  });

  it("rejects invalid severity", () => {
    const bad = {
      entity: "Webpack",
      signal: "Issues",
      source_tweet_ids: ["t1"],
      severity: "critical",
    };
    expect(() => FrictionPointSchema.parse(bad)).toThrow();
  });
});

describe("ScrubberOutputSchema", () => {
  it("validates a correct scrubber output", () => {
    const output = {
      capture_id: "550e8400-e29b-41d4-a716-446655440000",
      processed_at: "2025-01-15T12:30:00Z",
      total_input: 6,
      total_passed: 5,
      entities: [
        { name: "React", category: "framework", sentiment: "positive", friction_signal: false, mentions: 3 },
      ],
      friction_points: [],
      notable_tweets: [
        { tweet_id: "t1", relevance_score: 0.8, extracted_insight: "Good insight" },
      ],
    };
    expect(() => ScrubberOutputSchema.parse(output)).not.toThrow();
  });

  it("rejects relevance_score out of range", () => {
    const output = {
      capture_id: "550e8400-e29b-41d4-a716-446655440000",
      processed_at: "2025-01-15T12:30:00Z",
      total_input: 1,
      total_passed: 1,
      entities: [],
      friction_points: [],
      notable_tweets: [
        { tweet_id: "t1", relevance_score: 1.5, extracted_insight: "Bad score" },
      ],
    };
    expect(() => ScrubberOutputSchema.parse(output)).toThrow();
  });
});

describe("PatternClusterSchema", () => {
  it("validates a correct cluster", () => {
    const cluster = {
      cluster_id: "550e8400-e29b-41d4-a716-446655440000",
      entities: ["react", "svelte"],
      momentum_score: 65,
      momentum_delta: 12.5,
      direction: "rising",
      evidence_tweet_ids: ["t1", "t2", "t3"],
      friction_density: 0.5,
      first_seen: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => PatternClusterSchema.parse(cluster)).not.toThrow();
  });

  it("rejects momentum_score above 100", () => {
    const bad = {
      cluster_id: "550e8400-e29b-41d4-a716-446655440000",
      entities: ["react"],
      momentum_score: 101,
      momentum_delta: 0,
      direction: "stable",
      evidence_tweet_ids: [],
      friction_density: 0,
      first_seen: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => PatternClusterSchema.parse(bad)).toThrow();
  });

  it("rejects friction_density above 1", () => {
    const bad = {
      cluster_id: "550e8400-e29b-41d4-a716-446655440000",
      entities: ["react"],
      momentum_score: 50,
      momentum_delta: 0,
      direction: "stable",
      evidence_tweet_ids: [],
      friction_density: 1.5,
      first_seen: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => PatternClusterSchema.parse(bad)).toThrow();
  });

  it("rejects invalid direction", () => {
    const bad = {
      cluster_id: "550e8400-e29b-41d4-a716-446655440000",
      entities: ["react"],
      momentum_score: 50,
      momentum_delta: 0,
      direction: "sideways",
      evidence_tweet_ids: [],
      friction_density: 0.5,
      first_seen: "2025-01-15T12:00:00Z",
      window_hours: 48,
    };
    expect(() => PatternClusterSchema.parse(bad)).toThrow();
  });
});
