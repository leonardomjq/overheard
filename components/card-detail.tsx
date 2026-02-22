import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlphaCard } from "@/types";

const sourceLabels: Record<string, string> = {
  hackernews: "Hacker News",
  reddit: "Reddit",
  github: "GitHub",
  producthunt: "Product Hunt",
};

const sourceColors: Record<string, string> = {
  hackernews: "text-accent-amber",
  reddit: "text-accent-red",
  github: "text-text",
  producthunt: "text-accent-green",
};

interface CardDetailProps {
  card: AlphaCard;
}

export function CardDetail({ card }: CardDetailProps) {
  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2 block">
          {card.category.replace("-", " ")}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {card.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="font-mono">{card.date}</span>
          <Badge
            variant={card.signal_strength >= 7 ? "success" : "default"}
            shape="pill"
          >
            Strength: {card.signal_strength}/10
          </Badge>
          <span>{card.signal_count} signals</span>
        </div>
      </div>

      {/* Thesis */}
      <Card padding="spacious" className="mb-8 border-accent-green/20">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
          Thesis
        </h2>
        <p className="font-[family-name:var(--font-serif)] text-lg leading-relaxed">
          {card.thesis}
        </p>
      </Card>

      {/* Evidence */}
      <section className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-4">
          Evidence
        </h2>
        <div className="space-y-4">
          {card.evidence.map((ev, i) => (
            <Card key={i} padding="default" className="border-border">
              <p className="font-[family-name:var(--font-serif)] text-sm leading-relaxed mb-3">
                &ldquo;{ev.text}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span
                  className={`font-mono ${sourceColors[ev.source] ?? "text-text-muted"}`}
                >
                  {sourceLabels[ev.source] ?? ev.source}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">
                    {ev.engagement.toLocaleString()} engagement
                  </span>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-text transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Opportunity */}
      <Card padding="spacious" className="border-accent-green/20">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
          Opportunity
        </h2>
        <p className="font-[family-name:var(--font-serif)] text-base leading-relaxed">
          {card.opportunity}
        </p>
      </Card>
    </article>
  );
}
