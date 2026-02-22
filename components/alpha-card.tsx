"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, DURATION } from "@/lib/motion";
import type { AlphaCard as AlphaCardType } from "@/types";

interface AlphaCardProps {
  card: AlphaCardType;
}

const categoryColors: Record<string, string> = {
  "developer-tools": "text-accent-blue",
  "ai-ml": "text-accent-amber",
  saas: "text-accent-green",
  infrastructure: "text-accent-red",
  "business-model": "text-text-muted",
};

const sourceIcons: Record<string, string> = {
  hackernews: "HN",
  reddit: "R",
  github: "GH",
  producthunt: "PH",
};

export function AlphaCard({ card }: AlphaCardProps) {
  return (
    <motion.div
      {...fadeInUp}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: DURATION.normal }}
      className="h-full"
    >
      <Link href={`/card/${card.id}`} className="h-full">
        <Card
          variant="default"
          padding="spacious"
          className="texture-paper border-accent-green/30 hover:border-accent-green/50 transition-colors cursor-pointer h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest ${categoryColors[card.category] ?? "text-text-muted"}`}
            >
              {card.category.replace("-", " ")}
            </span>
            <Badge
              variant={card.signal_strength >= 7 ? "success" : "default"}
              shape="pill"
            >
              {card.signal_strength}/10
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-3 leading-snug">
            {card.title}
          </h3>

          {/* Thesis */}
          <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm line-clamp-2 leading-relaxed">
            {card.thesis}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-muted pt-3 mt-4 border-t border-text-dim/20">
            <span className="font-mono">{card.signal_count} signals</span>
            <div className="flex items-center gap-1.5">
              {card.sources.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] text-text-dim bg-surface-elevated px-1.5 py-0.5 rounded"
                >
                  {sourceIcons[s] ?? s}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
