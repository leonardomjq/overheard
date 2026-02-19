import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Preview } from "@/components/landing/preview";
import { Pricing } from "@/components/landing/pricing";
import { SocialProof } from "@/components/landing/social-proof";
import { ButtonLink } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-bg/80 backdrop-blur-md z-sticky border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent-green font-mono font-bold text-xl">
            Scout
          </span>
          <span className="text-text-muted font-mono text-xl">Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#pricing"
            className="text-text-muted hover:text-text text-sm transition-colors hidden sm:block"
          >
            Pricing
          </a>
          <Link
            href="/login"
            className="text-text-muted hover:text-text transition-colors text-sm"
          >
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm">
            Get Started
          </ButtonLink>
        </div>
      </header>

      {/* Sections */}
      <Hero />
      <Features />
      <Preview />
      <SocialProof />
      <Pricing />

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-text-muted text-sm">
        ScoutAgent &mdash; Built for founders, VCs, and technical leaders.
      </footer>
    </div>
  );
}
