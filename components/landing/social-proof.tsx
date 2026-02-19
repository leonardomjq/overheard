"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { viewportFadeIn } from "@/lib/motion";

const audiences = [
  "YC-backed founders",
  "Angel investors",
  "Dev leads",
  "Solo builders",
  "Startup scouts",
];

export function SocialProof() {
  return (
    <section className="px-6 py-16 max-w-3xl mx-auto text-center">
      <motion.div {...viewportFadeIn()}>
        <p className="text-text-muted text-sm mb-4">Built for</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {audiences.map((a) => (
            <Badge key={a} shape="tag" className="text-sm px-4 py-2">
              {a}
            </Badge>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
