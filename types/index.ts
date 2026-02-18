import type { z } from "zod";
import type {
  TweetDataSchema,
  RawCaptureSchema,
} from "@/schemas/capture";
import type {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
  PatternClusterSchema,
} from "@/schemas/refinery";
import type { AlphaCardSchema } from "@/schemas/alpha";
import type {
  LayerResultSchema,
  PipelineRunSchema,
} from "@/schemas/pipeline";

// Capture types
export type TweetData = z.infer<typeof TweetDataSchema>;
export type RawCapture = z.infer<typeof RawCaptureSchema>;

// Refinery types
export type TechEntity = z.infer<typeof TechEntitySchema>;
export type FrictionPoint = z.infer<typeof FrictionPointSchema>;
export type ScrubberOutput = z.infer<typeof ScrubberOutputSchema>;
export type PatternCluster = z.infer<typeof PatternClusterSchema>;

// Alpha types
export type AlphaCard = z.infer<typeof AlphaCardSchema>;
export type AlphaCategory = AlphaCard["category"];
export type AlphaDirection = AlphaCard["direction"];
export type AlphaStatus = AlphaCard["status"];

// Pipeline types
export type LayerResult = z.infer<typeof LayerResultSchema>;
export type PipelineRun = z.infer<typeof PipelineRunSchema>;

// Tier types
export type AlphaTier = "free" | "pro";
