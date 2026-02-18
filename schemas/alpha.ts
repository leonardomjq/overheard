import { z } from "zod";

export const AlphaCardSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  status: z.enum(["active", "expired", "archived"]),
  // Free tier fields
  title: z.string(),
  category: z.enum([
    "momentum_shift",
    "friction_opportunity",
    "emerging_tool",
    "contrarian_signal",
  ]),
  entities: z.array(z.string()),
  momentum_score: z.number().min(0).max(100),
  direction: z.enum(["rising", "falling", "stable"]),
  signal_count: z.number().int(),
  // Pro tier fields (nullable for free users after gating)
  thesis: z.string().nullable(),
  strategy: z.string().nullable(),
  risk_factors: z.array(z.string()).nullable(),
  evidence: z
    .array(
      z.object({
        tweet_id: z.string(),
        author: z.string(),
        snippet: z.string(),
        relevance: z.number(),
      })
    )
    .nullable(),
  friction_detail: z.string().nullable(),
  opportunity_window: z.string().nullable(),
  // "Build This" Blueprint (Pro tier)
  blueprint: z
    .object({
      product_concept: z.string(),
      name_ideas: z.array(z.string()).min(1).max(5),
      mvp_weeks: z.array(
        z.object({
          week: z.number().int().min(1),
          goal: z.string(),
          tasks: z.array(z.string()),
        })
      ),
      monetization: z.string(),
      tech_stack: z.array(z.string()),
      estimated_tam: z.string(),
    })
    .nullable(),
  cluster_id: z.string().uuid(),
});
