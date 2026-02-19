"use client";

import { motion } from "framer-motion";
import { ArrowUp, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { viewportFadeIn } from "@/lib/motion";

export function Preview() {
  return (
    <section id="preview" className="px-6 py-20 max-w-3xl mx-auto">
      <motion.div {...viewportFadeIn()}>
        <h2 className="text-2xl font-bold text-center mb-2">
          What an Alpha Card looks like
        </h2>
        <p className="text-text-muted text-center mb-8 text-sm">
          Real intelligence, not vaporware. Here&apos;s a sample brief.
        </p>

        {/* Mock card */}
        <Card variant="glass" padding="spacious">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-green">
              Emerging Tool
            </span>
            <Badge variant="success" shape="pill">
              <ArrowUp className="size-3" /> 87
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-2">
            Local-First SQLite ORMs Gaining Dev Traction
          </h3>

          {/* Entities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["drizzle-orm", "electric-sql", "cr-sqlite", "vlcn"].map(
              (entity) => (
                <Badge key={entity} shape="tag">
                  {entity}
                </Badge>
              ),
            )}
          </div>

          {/* Free content */}
          <p className="text-text-muted text-sm leading-relaxed mb-4">
            Multiple independent developers are converging on local-first
            SQLite solutions for web and mobile apps. Traction clusters around
            conflict-free replicated data types and edge-native sync engines.
          </p>

          {/* Blurred pro teaser */}
          <div className="relative mt-4">
            <div
              className="blur-sm select-none pointer-events-none"
              aria-hidden
            >
              <div className="space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-3/4" />
                <div className="h-4 bg-surface-elevated rounded w-full" />
                <div className="h-4 bg-surface-elevated rounded w-5/6" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 text-text-muted text-xs font-mono bg-surface/80 px-3 py-1.5 rounded border border-border">
                <Lock className="size-3" />
                upgrade to unlock full thesis &amp; strategy
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-muted mt-4 pt-3 border-t border-border">
            <span>14 signals</span>
            <Badge variant="success" shape="tag">
              // build this
            </Badge>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
