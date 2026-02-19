"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/motion";
import { Logo } from "@/components/logo";

interface AuthShellProps {
  panel: ReactNode;
  children: ReactNode;
}

export function AuthShell({ panel, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left branding panel — desktop only */}
      <div
        className={cn(
          "hidden lg:flex lg:w-[45%] relative flex-col justify-between",
          "bg-surface border-r border-border p-10"
        )}
      >
        {/* Texture overlays */}
        <div className="absolute inset-0 texture-noise pointer-events-none" />
        <div className="absolute inset-0 texture-paper pointer-events-none" />

        {/* Logo */}
        <Logo size="md" href="/" className="relative z-10" />

        {/* Page-specific panel content */}
        <div className="relative z-10 flex-1 flex items-center">
          {panel}
        </div>

        {/* Footer stat */}
        <p className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-text-dim">
          12,000+ signals analyzed weekly
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo — hidden on desktop */}
        <div className="lg:hidden mb-10">
          <Logo size="md" href="/" />
        </div>

        <motion.div
          className="w-full max-w-md"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
