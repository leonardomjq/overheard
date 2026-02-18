import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { runScrubber, persistScrubberOutput } from "./scrubber";
import {
  runPatternMatcher,
  persistClusters,
} from "./pattern-matcher";
import {
  synthesizeAlphaCard,
  persistAlphaCard,
} from "./strategist";
import type { PipelineRun, TweetData, ScrubberOutput } from "@/types";
import { PipelineRunSchema } from "@/schemas/pipeline";

interface PipelineResult {
  run: PipelineRun;
}

export async function runPipeline(): Promise<PipelineResult> {
  const supabase = createAdminClient();

  // Check for concurrent runs
  const { data: runningPipelines } = await supabase
    .from("pipeline_runs")
    .select("id")
    .eq("status", "running")
    .limit(1);

  if (runningPipelines && runningPipelines.length > 0) {
    throw new Error("Pipeline already running — concurrent execution prevented");
  }

  // Create pipeline run record
  const runId = uuidv4();
  const startedAt = new Date().toISOString();

  const { error: createError } = await supabase.from("pipeline_runs").insert({
    id: runId,
    started_at: startedAt,
    status: "running",
  });

  if (createError) throw new Error(`Failed to create pipeline run: ${createError.message}`);

  const errors: string[] = [];
  let totalTokens = 0;
  let l1Stats = { input: 0, passed: 0, failed: 0 };
  let l2Stats = { clusters_found: 0, clusters_qualifying: 0 };
  let l3Stats = { briefs_generated: 0, failed: 0 };
  let capturesProcessed = 0;

  try {
    // ========== LAYER 1: Scrubber ==========
    // Fetch pending captures
    const { data: pendingCaptures, error: fetchError } = await supabase
      .from("raw_captures")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) throw new Error(`Failed to fetch captures: ${fetchError.message}`);
    if (!pendingCaptures || pendingCaptures.length === 0) {
      // Nothing to process
      const run = await finalizePipeline(supabase, runId, startedAt, "completed", {
        capturesProcessed: 0,
        l1Stats,
        l2Stats,
        l3Stats,
        totalTokens,
        errors: ["No pending captures to process"],
      });
      return { run };
    }

    // Get already-processed tweet IDs
    const { data: processedRows } = await supabase
      .from("processed_tweet_ids")
      .select("tweet_id");
    const processedTweetIds = new Set(
      (processedRows ?? []).map((r) => r.tweet_id)
    );

    const scrubberOutputs: ScrubberOutput[] = [];

    for (const capture of pendingCaptures) {
      // Mark as processing
      await supabase
        .from("raw_captures")
        .update({ status: "processing" })
        .eq("id", capture.id);

      try {
        const tweets = (capture.payload as { tweets: TweetData[] }).tweets ?? [];
        l1Stats.input += tweets.length;

        const scrubberResult = await runScrubber(
          capture.capture_id,
          tweets,
          processedTweetIds
        );

        totalTokens += scrubberResult.tokensUsed;
        l1Stats.passed += scrubberResult.output.total_passed;
        l1Stats.failed += scrubberResult.errors.length;

        // Persist L1 output
        await persistScrubberOutput(
          scrubberResult.output,
          tweets.map((t) => t.tweet_id)
        );

        scrubberOutputs.push(scrubberResult.output);

        // Mark processed tweets in our local set too
        for (const t of tweets) processedTweetIds.add(t.tweet_id);

        // Mark capture as processed
        await supabase
          .from("raw_captures")
          .update({ status: "processed" })
          .eq("id", capture.id);

        capturesProcessed++;
        for (const err of scrubberResult.errors) {
          errors.push(`L1 batch ${err.batchIndex}: ${err.error}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`L1 capture ${capture.capture_id}: ${msg}`);
        await supabase
          .from("raw_captures")
          .update({ status: "failed", error_message: msg })
          .eq("id", capture.id);
      }
    }

    // ========== LAYER 2: Pattern Matcher ==========
    // Get all recent scrubber outputs (last 48h)
    const windowStart = new Date(
      Date.now() - 48 * 60 * 60 * 1000
    ).toISOString();
    const { data: recentOutputRows } = await supabase
      .from("scrubber_outputs")
      .select("*")
      .gte("processed_at", windowStart);

    const recentOutputs: ScrubberOutput[] = (recentOutputRows ?? []).map(
      (row) => ({
        capture_id: row.capture_id,
        processed_at: row.processed_at,
        total_input: row.total_input,
        total_passed: row.total_passed,
        entities: row.entities as unknown as ScrubberOutput["entities"],
        friction_points: row.friction_points as unknown as ScrubberOutput["friction_points"],
        notable_tweets: row.notable_tweets as unknown as ScrubberOutput["notable_tweets"],
      })
    );

    // Get previous clusters for momentum delta
    const { data: prevClusters } = await supabase
      .from("pattern_clusters")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const previousClusters = (prevClusters ?? []).map((c) => ({
      cluster_id: c.cluster_id,
      entities: c.entities,
      momentum_score: Number(c.momentum_score),
      momentum_delta: Number(c.momentum_delta),
      direction: c.direction as "rising" | "falling" | "stable",
      evidence_tweet_ids: c.evidence_tweet_ids,
      friction_density: Number(c.friction_density),
      first_seen: c.first_seen,
      window_hours: Number(c.window_hours),
    }));

    const patternResult = await runPatternMatcher(
      recentOutputs,
      previousClusters
    );

    l2Stats.clusters_found = patternResult.totalFound;
    l2Stats.clusters_qualifying = patternResult.qualifyingClusters.length;

    // Persist L2 output
    await persistClusters(patternResult.qualifyingClusters);

    // ========== LAYER 3: Strategist ==========
    for (const cluster of patternResult.qualifyingClusters) {
      try {
        const strategistResult = await synthesizeAlphaCard(
          cluster,
          recentOutputs
        );
        totalTokens += strategistResult.tokensUsed;

        if (strategistResult.error || !strategistResult.card) {
          l3Stats.failed++;
          errors.push(
            `L3 cluster ${cluster.cluster_id}: ${strategistResult.error ?? "No card generated"}`
          );
          continue;
        }

        await persistAlphaCard(strategistResult.card);
        l3Stats.briefs_generated++;
      } catch (err) {
        l3Stats.failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`L3 cluster ${cluster.cluster_id}: ${msg}`);
      }
    }

    const run = await finalizePipeline(supabase, runId, startedAt, "completed", {
      capturesProcessed,
      l1Stats,
      l2Stats,
      l3Stats,
      totalTokens,
      errors,
    });

    return { run };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(msg);

    const run = await finalizePipeline(supabase, runId, startedAt, "failed", {
      capturesProcessed,
      l1Stats,
      l2Stats,
      l3Stats,
      totalTokens,
      errors,
    });

    return { run };
  }
}

async function finalizePipeline(
  supabase: ReturnType<typeof createAdminClient>,
  runId: string,
  startedAt: string,
  status: "completed" | "failed",
  stats: {
    capturesProcessed: number;
    l1Stats: { input: number; passed: number; failed: number };
    l2Stats: { clusters_found: number; clusters_qualifying: number };
    l3Stats: { briefs_generated: number; failed: number };
    totalTokens: number;
    errors: string[];
  }
): Promise<PipelineRun> {
  const completedAt = new Date().toISOString();

  await supabase
    .from("pipeline_runs")
    .update({
      completed_at: completedAt,
      status,
      captures_processed: stats.capturesProcessed,
      l1_stats: stats.l1Stats,
      l2_stats: stats.l2Stats,
      l3_stats: stats.l3Stats,
      total_tokens_used: stats.totalTokens,
      errors: stats.errors,
    })
    .eq("id", runId);

  const run: PipelineRun = {
    id: runId,
    started_at: startedAt,
    completed_at: completedAt,
    status,
    captures_processed: stats.capturesProcessed,
    l1_stats: stats.l1Stats,
    l2_stats: stats.l2Stats,
    l3_stats: stats.l3Stats,
    total_tokens_used: stats.totalTokens,
    errors: stats.errors,
  };

  PipelineRunSchema.parse(run);
  return run;
}
