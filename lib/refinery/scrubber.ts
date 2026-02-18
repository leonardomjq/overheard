import { z } from "zod";
import pLimit from "p-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractStructured } from "@/lib/ai";
import {
  TechEntitySchema,
  FrictionPointSchema,
  ScrubberOutputSchema,
} from "@/schemas/refinery";
import type { TweetData, ScrubberOutput, TechEntity, FrictionPoint } from "@/types";

const BATCH_SIZE = 25;
const CONCURRENCY = 5;

// Heuristic filter: keyword-based noise detection
const NOISE_PATTERNS = [
  /\bgiveaway\b/i,
  /\bairdrop\b/i,
  /\bfollow.*retweet\b/i,
  /\bwin\s+\$?\d/i,
  /\b(dm|DM)\s+me\b/i,
  /\bcheck\s+my\s+bio\b/i,
  /\bfree\s+nft\b/i,
  /\b🚀{3,}/,
];

const SIGNAL_KEYWORDS = [
  "migration", "migrating", "switched", "switching",
  "bug", "broken", "issue", "error", "crash",
  "deprecated", "deprecating",
  "released", "launching", "shipped",
  "friction", "pain point", "workaround",
  "benchmark", "performance", "faster", "slower",
  "alternative", "replaced", "replacing",
  "framework", "library", "sdk", "api",
  "typescript", "rust", "go", "python", "javascript",
  "react", "nextjs", "svelte", "vue", "angular",
  "docker", "kubernetes", "wasm", "edge",
];

export function isNoise(content: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(content));
}

export function hasSignal(content: string): boolean {
  const lower = content.toLowerCase();
  return SIGNAL_KEYWORDS.some((kw) => lower.includes(kw));
}

export function filterTweets(tweets: TweetData[]): TweetData[] {
  return tweets.filter((t) => !isNoise(t.content) && hasSignal(t.content));
}

// Schema for LLM batch extraction
const BatchExtractionSchema = z.object({
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

type BatchExtraction = z.infer<typeof BatchExtractionSchema>;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function extractBatch(
  tweets: TweetData[]
): Promise<{ data: BatchExtraction | null; tokensUsed: number; error?: string }> {
  const tweetSummaries = tweets
    .map(
      (t) =>
        `[${t.tweet_id}] @${t.author_handle} (${t.author_followers} followers): ${t.content.slice(0, 500)}`
    )
    .join("\n\n");

  const result = await extractStructured<BatchExtraction>({
    model: "claude-haiku",
    system: `You are a tech-market intelligence analyst. Extract structured signals from developer tweets.
Focus on: technology shifts, developer friction points, emerging tools, sentiment changes.
Be precise with entity categorization and friction severity assessment.`,
    prompt: `Analyze these developer tweets and extract:
1. Tech entities mentioned (frameworks, languages, tools, platforms, protocols, concepts) with sentiment and friction signals
2. Friction points (pain points, bugs, migration issues) with severity
3. Notable tweets with relevance scores (0-1) and extracted insights

Tweets:
${tweetSummaries}`,
    schema: BatchExtractionSchema,
  });

  if ("error" in result) {
    return { data: null, tokensUsed: result.tokensUsed, error: result.error };
  }
  return { data: result.data, tokensUsed: result.tokensUsed };
}

export interface ScrubberResult {
  output: ScrubberOutput;
  tokensUsed: number;
  errors: Array<{ batchIndex: number; error: string }>;
}

export async function runScrubber(
  captureId: string,
  tweets: TweetData[],
  processedTweetIds: Set<string>
): Promise<ScrubberResult> {
  // Dedup at tweet level
  const newTweets = tweets.filter((t) => !processedTweetIds.has(t.tweet_id));

  // Heuristic filter
  const signalTweets = filterTweets(newTweets);

  // Batch and extract
  const batches = chunkArray(signalTweets, BATCH_SIZE);
  const limit = pLimit(CONCURRENCY);
  let totalTokens = 0;
  const errors: Array<{ batchIndex: number; error: string }> = [];

  const allEntities: TechEntity[] = [];
  const allFriction: FrictionPoint[] = [];
  const allNotable: BatchExtraction["notable_tweets"] = [];

  const results = await Promise.allSettled(
    batches.map((batch, idx) =>
      limit(async () => {
        const result = await extractBatch(batch);
        totalTokens += result.tokensUsed;
        if (result.error || !result.data) {
          errors.push({ batchIndex: idx, error: result.error ?? "No data returned" });
          return;
        }
        allEntities.push(...result.data.entities);
        allFriction.push(...result.data.friction_points);
        allNotable.push(...result.data.notable_tweets);
      })
    )
  );

  // Check for unexpected rejections
  results.forEach((r, idx) => {
    if (r.status === "rejected") {
      errors.push({ batchIndex: idx, error: String(r.reason) });
    }
  });

  // Merge duplicate entities by name
  const entityMap = new Map<string, TechEntity>();
  for (const entity of allEntities) {
    const key = entity.name.toLowerCase();
    const existing = entityMap.get(key);
    if (existing) {
      existing.mentions += entity.mentions;
      if (entity.friction_signal) existing.friction_signal = true;
    } else {
      entityMap.set(key, { ...entity });
    }
  }

  const output: ScrubberOutput = {
    capture_id: captureId,
    processed_at: new Date().toISOString(),
    total_input: tweets.length,
    total_passed: signalTweets.length,
    entities: Array.from(entityMap.values()),
    friction_points: allFriction,
    notable_tweets: allNotable,
  };

  // Validate output
  ScrubberOutputSchema.parse(output);

  return { output, tokensUsed: totalTokens, errors };
}

export async function persistScrubberOutput(
  output: ScrubberOutput,
  tweetIds: string[]
): Promise<void> {
  const supabase = createAdminClient();

  // Insert scrubber output
  const { error: insertError } = await supabase
    .from("scrubber_outputs")
    .insert({
      capture_id: output.capture_id,
      processed_at: output.processed_at,
      total_input: output.total_input,
      total_passed: output.total_passed,
      entities: JSON.parse(JSON.stringify(output.entities)),
      friction_points: JSON.parse(JSON.stringify(output.friction_points)),
      notable_tweets: JSON.parse(JSON.stringify(output.notable_tweets)),
    });

  if (insertError) throw new Error(`Failed to insert scrubber output: ${insertError.message}`);

  // Mark tweets as processed
  if (tweetIds.length > 0) {
    const { error: tweetError } = await supabase
      .from("processed_tweet_ids")
      .upsert(
        tweetIds.map((id) => ({
          tweet_id: id,
          capture_id: output.capture_id,
        })),
        { onConflict: "tweet_id" }
      );

    if (tweetError) throw new Error(`Failed to mark tweets as processed: ${tweetError.message}`);
  }
}
