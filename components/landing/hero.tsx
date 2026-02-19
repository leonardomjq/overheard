"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function Hero() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24 lg:py-32 relative">
      <motion.div
        className="max-w-3xl space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Pill badge */}
        <motion.div variants={staggerItem}>
          <Badge variant="success" shape="pill" className="px-4 py-1.5">
            Watching what devs ship, not what VCs say
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          variants={staggerItem}
        >
          Venture Intelligence
          <br />
          <span className="text-accent-green">Before the Mainstream</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto"
          variants={staggerItem}
        >
          ScoutAgent tracks what developers are building and shipping, spots
          where traction is clustering, and tells you exactly what to build
          next.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          variants={staggerItem}
        >
          <ButtonLink href="/signup" size="lg" className="w-full sm:w-auto">
            Start Free
          </ButtonLink>
          <ButtonLink
            href="#preview"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            See how it works
          </ButtonLink>
        </motion.div>
      </motion.div>

      {/* Bounce chevron */}
      <motion.div
        className="absolute bottom-8"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown className="size-6 text-text-muted" />
      </motion.div>
    </section>
  );
}
