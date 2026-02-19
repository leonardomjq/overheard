import { createClient } from "@/lib/supabase/server";
import { gateAlphaCard } from "@/lib/refinery/gate";
import { MomentumBadge } from "@/components/momentum-badge";
import { BlurGate } from "@/components/blur-gate";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyLinkButton } from "@/components/copy-link-button";
import { InlineUpgradeHint } from "@/components/inline-upgrade-hint";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlphaCard, AlphaTier } from "@/types";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

const categoryLabels: Record<string, string> = {
  momentum_shift: "Momentum Shift",
  friction_opportunity: "Friction Opportunity",
  emerging_tool: "Emerging Tool",
  contrarian_signal: "Contrarian Signal",
};

export default async function AlphaDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  const tier: AlphaTier = (profile?.tier as AlphaTier) ?? "free";

  const { data: rawCard } = await supabase
    .from("alpha_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (!rawCard) notFound();

  const card = gateAlphaCard(rawCard as unknown as AlphaCard, tier);
  const isLocked = tier === "free";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Breadcrumbs
          crumbs={[
            { label: "Feed", href: "/" },
            { label: card.title },
          ]}
        />
        <CopyLinkButton />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-amber">
              {categoryLabels[card.category] ?? card.category}
            </span>
            <MomentumBadge
              score={card.momentum_score}
              direction={card.direction}
            />
          </div>
          <h1 className="text-3xl font-bold">{card.title}</h1>
        </div>

        {/* Entities */}
        <div className="flex flex-wrap gap-2">
          {card.entities.map((entity) => (
            <Badge key={entity} shape="tag" className="text-sm px-3 py-1">
              {entity}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card padding="compact">
            <div className="text-text-muted text-xs mb-1">Signals</div>
            <div className="text-2xl font-bold font-mono">
              {card.signal_count}
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs mb-1">Momentum</div>
            <div className="text-2xl font-bold font-mono">
              {Math.round(card.momentum_score)}
            </div>
          </Card>
          <Card padding="compact">
            <div className="text-text-muted text-xs mb-1">Expires</div>
            <div className="text-sm font-mono">
              {new Date(card.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
              })}
            </div>
          </Card>
        </div>

        {/* Pro content sections */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Thesis</h2>
            <BlurGate isLocked={isLocked}>
              <p className="text-text-muted leading-relaxed">{card.thesis}</p>
            </BlurGate>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Strategy</h2>
            {isLocked ? (
              <InlineUpgradeHint />
            ) : (
              <p className="text-text-muted leading-relaxed">{card.strategy}</p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Risk Factors</h2>
            {isLocked ? (
              <InlineUpgradeHint />
            ) : (
              <ul className="list-disc list-inside text-text-muted space-y-1">
                {card.risk_factors?.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Evidence</h2>
            {isLocked ? (
              <InlineUpgradeHint />
            ) : (
              <div className="space-y-3">
                {card.evidence?.map((ev) => (
                  <Card key={ev.tweet_id} padding="compact">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-accent-green">
                        @{ev.author}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {Math.round(ev.relevance * 100)}% relevant
                      </span>
                    </div>
                    <p className="text-text-muted text-sm">{ev.snippet}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {card.friction_detail !== null && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Friction Detail</h2>
              {isLocked ? (
                <InlineUpgradeHint />
              ) : (
                <p className="text-text-muted leading-relaxed">
                  {card.friction_detail}
                </p>
              )}
            </section>
          )}

          {card.opportunity_window !== null && (
            <section>
              <h2 className="text-lg font-semibold mb-3">Opportunity Window</h2>
              {isLocked ? (
                <InlineUpgradeHint />
              ) : (
                <p className="text-text-muted leading-relaxed">
                  {card.opportunity_window}
                </p>
              )}
            </section>
          )}

          {/* Build This Blueprint */}
          {card.blueprint !== null && (
            <section className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-accent-green font-mono text-sm">
                  //
                </span>
                <h2 className="text-xl font-bold">Build This</h2>
              </div>
              <BlurGate isLocked={isLocked}>
                <div className="space-y-5">
                  {/* Product concept */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Product Concept
                    </h3>
                    <p className="text-text leading-relaxed">
                      {card.blueprint.product_concept}
                    </p>
                  </div>

                  {/* Name ideas */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Name Ideas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {card.blueprint.name_ideas.map((name) => (
                        <Badge
                          key={name}
                          variant="success"
                          shape="tag"
                          className="text-sm px-3 py-1"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* MVP Roadmap */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                      MVP Roadmap
                    </h3>
                    <div className="space-y-4">
                      {card.blueprint.mvp_weeks.map((week) => (
                        <Card key={week.week} padding="compact">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="success" shape="tag">
                              Week {week.week}
                            </Badge>
                            <span className="font-semibold text-sm">
                              {week.goal}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {week.tasks.map((task, i) => (
                              <li
                                key={i}
                                className="text-text-muted text-sm flex items-start gap-2"
                              >
                                <span className="text-border mt-1">-</span>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {card.blueprint.tech_stack.map((tech) => (
                        <Badge
                          key={tech}
                          shape="tag"
                          className="text-sm px-3 py-1"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Monetization */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Monetization
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {card.blueprint.monetization}
                    </p>
                  </div>

                  {/* TAM */}
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Estimated Market
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {card.blueprint.estimated_tam}
                    </p>
                  </div>
                </div>
              </BlurGate>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
