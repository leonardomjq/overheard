"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MomentumBadge } from "./momentum-badge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, DURATION } from "@/lib/motion";
import type { AlphaCard as AlphaCardType } from "@/types";

interface AlphaCardProps {
  card: AlphaCardType;
}

const categoryLabels: Record<string, string> = {
  momentum_shift: "Momentum Shift",
  friction_opportunity: "Friction Opportunity",
  emerging_tool: "Emerging Tool",
  contrarian_signal: "Contrarian Signal",
};

const categoryColors: Record<string, string> = {
  momentum_shift: "text-accent-blue",
  friction_opportunity: "text-accent-amber",
  emerging_tool: "text-accent-green",
  contrarian_signal: "text-accent-red",
};

export function AlphaCard({ card }: AlphaCardProps) {
  return (
    <motion.div
      {...fadeInUp}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: DURATION.normal }}
    >
      <Link href={`/alpha/${card.id}`}>
        <Card
          variant="glass"
          className="hover:border-accent-green/30 transition-colors cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <span
              className={`text-xs font-mono uppercase tracking-wider ${categoryColors[card.category] ?? "text-text-muted"}`}
            >
              {categoryLabels[card.category] ?? card.category}
            </span>
            <MomentumBadge
              score={card.momentum_score}
              direction={card.direction}
            />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 leading-snug">
            {card.title}
          </h3>

          {/* Entities */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {card.entities.map((entity) => (
              <Badge key={entity} shape="tag">
                {entity}
              </Badge>
            ))}
          </div>

          {/* Thesis preview (pro only) */}
          {card.thesis && (
            <p className="text-text-muted text-sm line-clamp-2 mb-3">
              {card.thesis}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <span>{card.signal_count} signals</span>
              {card.blueprint && (
                <Badge variant="success" shape="tag">
                  // build this
                </Badge>
              )}
            </div>
            <span>
              Expires{" "}
              {new Date(card.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
