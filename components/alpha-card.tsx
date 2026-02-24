import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AlphaCard as AlphaCardType } from "@/types";

interface AlphaCardProps {
  card: AlphaCardType;
}

const sourceColors: Record<string, string> = {
  hackernews: "border-l-source-hn",
  reddit: "border-l-source-reddit",
  github: "border-l-source-github",
  producthunt: "border-l-source-ph",
};

export function AlphaCard({ card }: AlphaCardProps) {
  const bestEvidence = card.evidence[0];
  const uniqueSources = new Set(card.sources);

  return (
    <article className="relative bg-surface border border-border p-5 rounded-lg transition-colors hover:border-border-strong">
      {/* Category — sits above the stretched link */}
      <Link
        href={`/category/${card.category}`}
        className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-text-dim mb-3 block hover:text-accent transition-colors"
      >
        {card.category.replace(/-/g, " ")}
      </Link>

      {/* Title — stretched link covers entire card */}
      <Link href={`/card/${card.id}`} className="block after:absolute after:inset-0">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug mb-2">
          {card.title}
        </h3>
      </Link>

      {/* Thesis — read layer, primary content */}
      <p className="font-[family-name:var(--font-serif)] text-base text-text leading-relaxed">
        {card.thesis}
      </p>

      {/* Best evidence quote — proof layer */}
      {bestEvidence && (
        <blockquote
          className={cn(
            "mt-4 pl-3 border-l-2",
            sourceColors[bestEvidence.source] ?? "border-l-text-dim"
          )}
        >
          <p className="font-[family-name:var(--font-serif)] text-sm text-text-muted leading-relaxed line-clamp-2">
            &ldquo;{bestEvidence.text}&rdquo;
          </p>
        </blockquote>
      )}

      {/* Opportunity teaser */}
      <div className="mt-4 pt-3 border-t border-border">
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-muted">
          Opportunity
        </span>
        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mt-1">
          {card.opportunity}
        </p>
      </div>

      {/* Footer */}
      <div className="text-[10px] font-mono text-text-dim pt-3 mt-3 border-t border-border">
        {card.evidence.length} evidence &middot; {uniqueSources.size} sources
      </div>
    </article>
  );
}
