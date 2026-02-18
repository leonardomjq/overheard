"use client";

import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-surface">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-accent-green font-mono font-bold text-lg">
          Scout
        </span>
        <span className="text-text-muted font-mono text-lg">Agent</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="text-text-muted hover:text-text text-sm transition-colors"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
