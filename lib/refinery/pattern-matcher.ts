import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { PatternClusterSchema } from "@/schemas/refinery";
import type { ScrubberOutput, TechEntity, PatternCluster } from "@/types";

const MINIMUM_CO_OCCURRENCE = 3;
const MOMENTUM_THRESHOLD = 30;
const WINDOW_HOURS = 48;

interface CoOccurrence {
  entities: string[];
  tweetIds: Set<string>;
  totalMentions: number;
  frictionCount: number;
  authorWeights: number;
}

// Build entity co-occurrence from scrubber outputs within the time window
function buildCoOccurrenceMatrix(
  outputs: ScrubberOutput[]
): Map<string, CoOccurrence> {
  // Map tweet → entities mentioned in that tweet
  const tweetEntities = new Map<string, Set<string>>();
  const entityFriction = new Map<string, boolean>();
  const entityMentions = new Map<string, number>();

  for (const output of outputs) {
    // Track entity properties
    for (const entity of output.entities) {
      const key = entity.name.toLowerCase();
      entityMentions.set(key, (entityMentions.get(key) ?? 0) + entity.mentions);
      if (entity.friction_signal) entityFriction.set(key, true);
    }

    // Track which entities appear in which tweets via notable_tweets and friction_points
    for (const notable of output.notable_tweets) {
      if (!tweetEntities.has(notable.tweet_id)) {
        tweetEntities.set(notable.tweet_id, new Set());
      }
    }

    for (const fp of output.friction_points) {
      for (const tweetId of fp.source_tweet_ids) {
        if (!tweetEntities.has(tweetId)) {
          tweetEntities.set(tweetId, new Set());
        }
        tweetEntities.get(tweetId)!.add(fp.entity.toLowerCase());
      }
    }

    // Associate entities with tweets from notable_tweets
    for (const entity of output.entities) {
      const key = entity.name.toLowerCase();
      // Associate with all notable tweets from same capture
      for (const notable of output.notable_tweets) {
        if (
          notable.extracted_insight.toLowerCase().includes(key) ||
          notable.relevance_score > 0.5
        ) {
          if (!tweetEntities.has(notable.tweet_id)) {
            tweetEntities.set(notable.tweet_id, new Set());
          }
          tweetEntities.get(notable.tweet_id)!.add(key);
        }
      }
    }
  }

  // Find co-occurring entity pairs/groups
  const pairMap = new Map<string, CoOccurrence>();

  for (const [tweetId, entities] of tweetEntities) {
    const entityList = Array.from(entities).sort();
    if (entityList.length < 2) continue;

    // Generate pairs
    for (let i = 0; i < entityList.length; i++) {
      for (let j = i + 1; j < entityList.length; j++) {
        const key = `${entityList[i]}|${entityList[j]}`;
        if (!pairMap.has(key)) {
          pairMap.set(key, {
            entities: [entityList[i], entityList[j]],
            tweetIds: new Set(),
            totalMentions: 0,
            frictionCount: 0,
            authorWeights: 0,
          });
        }
        const pair = pairMap.get(key)!;
        pair.tweetIds.add(tweetId);
      }
    }
  }

  // Compute metrics for qualifying pairs
  for (const [, pair] of pairMap) {
    pair.totalMentions = pair.entities.reduce(
      (sum, e) => sum + (entityMentions.get(e) ?? 0),
      0
    );
    pair.frictionCount = pair.entities.filter(
      (e) => entityFriction.get(e) ?? false
    ).length;
  }

  return pairMap;
}

export function computeMomentum(
  mentionVelocity: number,
  frictionDensity: number,
  authorWeightSum: number
): number {
  return Math.min(
    100,
    mentionVelocity * Math.sqrt(Math.max(frictionDensity, 0.01)) * Math.max(authorWeightSum, 1)
  );
}

export function determineMomentumDirection(
  currentScore: number,
  previousScore: number | null
): "rising" | "falling" | "stable" {
  if (previousScore === null) return "rising";
  const delta = currentScore - previousScore;
  if (delta > 5) return "rising";
  if (delta < -5) return "falling";
  return "stable";
}

export interface PatternMatcherResult {
  clusters: PatternCluster[];
  qualifyingClusters: PatternCluster[];
  totalFound: number;
}

export async function runPatternMatcher(
  recentOutputs: ScrubberOutput[],
  previousClusters?: PatternCluster[]
): Promise<PatternMatcherResult> {
  const coOccurrences = buildCoOccurrenceMatrix(recentOutputs);

  // Filter to minimum co-occurrence threshold
  const qualifying = Array.from(coOccurrences.values()).filter(
    (co) => co.tweetIds.size >= MINIMUM_CO_OCCURRENCE
  );

  // Build previous score lookup
  const prevScoreMap = new Map<string, number>();
  if (previousClusters) {
    for (const cluster of previousClusters) {
      const key = cluster.entities.sort().join("|");
      prevScoreMap.set(key, cluster.momentum_score);
    }
  }

  const now = new Date().toISOString();

  const clusters: PatternCluster[] = qualifying.map((co) => {
    const mentionVelocity = co.totalMentions / WINDOW_HOURS;
    const frictionDensity = co.frictionCount / co.entities.length;
    const authorWeightSum = Math.log2(co.tweetIds.size + 1);
    const momentumScore = computeMomentum(
      mentionVelocity,
      frictionDensity,
      authorWeightSum
    );

    const entityKey = co.entities.sort().join("|");
    const previousScore = prevScoreMap.get(entityKey) ?? null;
    const direction = determineMomentumDirection(momentumScore, previousScore);
    const delta = previousScore !== null ? momentumScore - previousScore : momentumScore;

    const cluster: PatternCluster = {
      cluster_id: uuidv4(),
      entities: co.entities,
      momentum_score: Math.round(momentumScore * 100) / 100,
      momentum_delta: Math.round(delta * 100) / 100,
      direction,
      evidence_tweet_ids: Array.from(co.tweetIds),
      friction_density: Math.round(frictionDensity * 100) / 100,
      first_seen: now,
      window_hours: WINDOW_HOURS,
    };

    PatternClusterSchema.parse(cluster);
    return cluster;
  });

  const qualifyingClusters = clusters.filter(
    (c) => c.momentum_score >= MOMENTUM_THRESHOLD
  );

  return {
    clusters,
    qualifyingClusters,
    totalFound: clusters.length,
  };
}

export async function persistClusters(
  clusters: PatternCluster[]
): Promise<void> {
  if (clusters.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("pattern_clusters").insert(
    clusters.map((c) => ({
      cluster_id: c.cluster_id,
      entities: c.entities,
      momentum_score: c.momentum_score,
      momentum_delta: c.momentum_delta,
      direction: c.direction,
      evidence_tweet_ids: c.evidence_tweet_ids,
      friction_density: c.friction_density,
      first_seen: c.first_seen,
      window_hours: c.window_hours,
    }))
  );

  if (error) throw new Error(`Failed to persist clusters: ${error.message}`);
}
