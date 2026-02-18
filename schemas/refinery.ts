import { z } from "zod";

export const TechEntitySchema = z.object({
  name: z.string(),
  category: z.enum([
    "framework",
    "language",
    "tool",
    "platform",
    "protocol",
    "concept",
  ]),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  friction_signal: z.boolean(),
  mentions: z.number().int().nonnegative(),
});

export const FrictionPointSchema = z.object({
  entity: z.string(),
  signal: z.string(),
  source_tweet_ids: z.array(z.string()),
  severity: z.enum(["low", "medium", "high"]),
});

export const ScrubberOutputSchema = z.object({
  capture_id: z.string().uuid(),
  processed_at: z.string().datetime(),
  total_input: z.number().int(),
  total_passed: z.number().int(),
  entities: z.array(TechEntitySchema),
  friction_points: z.array(FrictionPointSchema),
  notable_tweets: z.array(
    z.object({
      tweet_id: z.string(),
      relevance_score: z.number().min(0).max(1),
      extracted_insight: z.string(),
    })
  ),
});

export const PatternClusterSchema = z.object({
  cluster_id: z.string().uuid(),
  entities: z.array(z.string()),
  momentum_score: z.number().min(0).max(100),
  momentum_delta: z.number(),
  direction: z.enum(["rising", "falling", "stable"]),
  evidence_tweet_ids: z.array(z.string()),
  friction_density: z.number().min(0).max(1),
  first_seen: z.string().datetime(),
  window_hours: z.number(),
});
