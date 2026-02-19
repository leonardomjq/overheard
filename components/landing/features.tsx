"use client";

import { motion } from "framer-motion";
import { Radio, GitBranch, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { viewportFadeIn } from "@/lib/motion";

const features = [
  {
    number: "01",
    title: "Signal Detection",
    description:
      "Monitors what developers are building, launching, and growing — 24/7, across thousands of conversations.",
    color: "text-accent-green",
    Icon: Radio,
  },
  {
    number: "02",
    title: "Pattern Matching",
    description:
      "Spots when multiple builders are finding traction in the same space — validated demand, not guesswork.",
    color: "text-accent-amber",
    Icon: GitBranch,
  },
  {
    number: "03",
    title: "Alpha Cards",
    description:
      "Actionable intelligence briefs with thesis, strategy, and evidence — delivered fresh every 72 hours.",
    color: "text-accent-blue",
    Icon: Layers,
  },
];

export function Features() {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.number} {...viewportFadeIn(i * 0.1)}>
            <Card padding="spacious" className="text-left h-full">
              <div
                className={`flex items-center gap-2 ${f.color} text-2xl mb-3`}
              >
                <f.Icon className="size-5" />
                <span>{f.number}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm">{f.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
