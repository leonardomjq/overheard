import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 bg-surface/80 backdrop-blur-md z-sticky border-b border-text-dim/20 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Logo size="sm" href="/" />
        <nav className="flex items-center gap-6">
          <Link
            href="/archive"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            Archive
          </Link>
          <Link
            href="/about"
            className="font-mono text-xs text-text-muted hover:text-text transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
