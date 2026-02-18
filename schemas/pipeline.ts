import { z } from "zod";

export const LayerResultSchema = z.object({
  success: z.array(z.unknown()),
  failed: z.array(
    z.object({
      item_id: z.string(),
      error: z.string(),
    })
  ),
  errors: z.array(
    z.object({
      message: z.string(),
      code: z.string().optional(),
      layer: z.enum(["scrubber", "pattern_matcher", "strategist"]),
    })
  ),
});

export const PipelineRunSchema = z.object({
  id: z.string().uuid(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
  status: z.enum(["running", "completed", "failed"]),
  captures_processed: z.number().int(),
  l1_stats: z.object({
    input: z.number(),
    passed: z.number(),
    failed: z.number(),
  }),
  l2_stats: z.object({
    clusters_found: z.number(),
    clusters_qualifying: z.number(),
  }),
  l3_stats: z.object({
    briefs_generated: z.number(),
    failed: z.number(),
  }),
  total_tokens_used: z.number().int(),
  errors: z.array(z.string()),
});
