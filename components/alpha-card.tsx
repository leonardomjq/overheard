"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MomentumBadge } from "./momentum-badge";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/alpha/${card.id}`}>
        <div className="bg-white/[0.03] backdrop-blur-xl border border-border rounded-xl p-5 hover:border-accent-green/30 transition-colors cursor-pointer">
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
              <span
                key={entity}
                className="bg-surface-elevated text-text-muted text-xs px-2 py-0.5 rounded font-mono"
              >
                {entity}
              </span>
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
                <span className="text-accent-green border border-accent-green/20 bg-accent-green/5 px-1.5 py-0.5 rounded font-mono">
                  // build this
                </span>
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
        </div>
      </Link>
    </motion.div>
  );
}
