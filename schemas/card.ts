import { z } from "zod";

export const EvidenceSchema = z.object({
  text: z.string(),
  source: z.enum(["hackernews", "reddit", "github", "producthunt"]),
  url: z.string().optional(),
  engagement: z.number(),
});

export const AlphaCardSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  category: z.string(),
  thesis: z.string(),
  signal_strength: z.number().min(1).max(10),
  evidence: z.array(EvidenceSchema),
  opportunity: z.string(),
  sources: z.array(z.string()),
  signal_count: z.number(),
});

export const DailyDataSchema = z.object({
  date: z.string(),
  generated_at: z.string(),
  cards: z.array(AlphaCardSchema),
});
