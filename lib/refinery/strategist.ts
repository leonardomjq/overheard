import { v4 as uuidv4 } from "uuid";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractStructured } from "@/lib/ai";
import { AlphaCardSchema } from "@/schemas/alpha";
import type { AlphaCard, PatternCluster, ScrubberOutput } from "@/types";

const TTL_HOURS = 72;

// Schema for LLM synthesis (without id/created_at/expires_at/status which we set)
const StrategistOutputSchema = AlphaCardSchema.omit({
  id: true,
  created_at: true,
  expires_at: true,
  status: true,
  cluster_id: true,
});

function buildContext(
  cluster: PatternCluster,
  recentOutputs: ScrubberOutput[]
): string {
  const entityList = cluster.entities.join(", ");
  const frictionPoints: string[] = [];
  const insights: string[] = [];

  for (const output of recentOutputs) {
    for (const fp of output.friction_points) {
      if (cluster.entities.some((e) => fp.entity.toLowerCase() === e.toLowerCase())) {
        frictionPoints.push(`- [${fp.severity}] ${fp.entity}: ${fp.signal}`);
      }
    }
    for (const notable of output.notable_tweets) {
      if (cluster.evidence_tweet_ids.includes(notable.tweet_id)) {
        insights.push(
          `- @tweet ${notable.tweet_id} (relevance: ${notable.relevance_score}): ${notable.extracted_insight}`
        );
      }
    }
  }

  return `## Cluster Analysis
Entities: ${entityList}
Momentum Score: ${cluster.momentum_score}/100 (${cluster.direction}, delta: ${cluster.momentum_delta})
Friction Density: ${cluster.friction_density}
Evidence Tweets: ${cluster.evidence_tweet_ids.length}
Window: ${cluster.window_hours}h

## Friction Points
${frictionPoints.length > 0 ? frictionPoints.join("\n") : "None identified"}

## Key Insights
${insights.length > 0 ? insights.join("\n") : "No specific insights extracted"}`;
}

export interface StrategistResult {
  card: AlphaCard | null;
  tokensUsed: number;
  error?: string;
}

export async function synthesizeAlphaCard(
  cluster: PatternCluster,
  recentOutputs: ScrubberOutput[]
): Promise<StrategistResult> {
  const context = buildContext(cluster, recentOutputs);

  const result = await extractStructured({
    model: "claude-sonnet",
    system: `You are a venture intelligence strategist. You transform technical signal clusters into actionable market intelligence ("Alpha Cards") for indie hackers, founders, and technical builders who want to find and capitalize on emerging opportunities.

Your output must be:
- Specific and actionable, not generic
- Time-bound with clear opportunity windows
- Evidence-backed with concrete examples
- Risk-aware with honest assessment of uncertainties
- Include a "Build This" blueprint: a concrete product idea with a buildable MVP plan

Categories:
- momentum_shift: Significant change in developer adoption/sentiment
- friction_opportunity: Pain point creating market opportunity
- emerging_tool: New tool gaining rapid traction
- contrarian_signal: Counter-narrative worth investigating`,
    prompt: `Based on this technical signal cluster, generate a complete Alpha Card intelligence brief with a "Build This" blueprint.

${context}

Generate a structured Alpha Card with:
1. A compelling, specific title
2. Correct category classification
3. A thesis explaining the opportunity
4. A concrete strategy for capitalizing on this signal
5. Risk factors to consider
6. Evidence supporting the thesis
7. Friction details if applicable
8. An opportunity window estimate
9. A "Build This" blueprint containing:
   - product_concept: A specific, concrete product/tool/SaaS idea (not vague — name exactly what it does)
   - name_ideas: 3 catchy product name suggestions
   - mvp_weeks: A 3-4 week MVP plan where each week has a goal and specific tasks
   - monetization: A specific monetization strategy (pricing model, target price point, who pays)
   - tech_stack: Recommended technologies to build it with
   - estimated_tam: Rough total addressable market estimate based on the signals`,
    schema: StrategistOutputSchema,
  });

  if ("error" in result) {
    return { card: null, tokensUsed: result.tokensUsed, error: result.error };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000);

  const card: AlphaCard = {
    id: uuidv4(),
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: "active",
    cluster_id: cluster.cluster_id,
    ...result.data,
  };

  // Validate the full card
  AlphaCardSchema.parse(card);

  return { card, tokensUsed: result.tokensUsed };
}

export async function persistAlphaCard(card: AlphaCard): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("alpha_cards").insert({
    id: card.id,
    created_at: card.created_at,
    expires_at: card.expires_at,
    status: card.status,
    title: card.title,
    category: card.category,
    entities: card.entities,
    momentum_score: card.momentum_score,
    direction: card.direction,
    signal_count: card.signal_count,
    thesis: card.thesis,
    strategy: card.strategy,
    risk_factors: card.risk_factors,
    evidence: card.evidence ? JSON.parse(JSON.stringify(card.evidence)) : null,
    friction_detail: card.friction_detail,
    opportunity_window: card.opportunity_window,
    blueprint: card.blueprint ? JSON.parse(JSON.stringify(card.blueprint)) : null,
    cluster_id: card.cluster_id,
  });

  if (error) throw new Error(`Failed to persist alpha card: ${error.message}`);
}
