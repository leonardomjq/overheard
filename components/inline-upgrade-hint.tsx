import Link from "next/link";
import { Lock } from "lucide-react";

export function InlineUpgradeHint() {
  return (
    <div className="flex items-center gap-2 py-3 px-4 rounded bg-surface border border-border text-sm text-text-muted">
      <Lock className="size-3.5 shrink-0" />
      <span>
        Pro feature —{" "}
        <Link
          href="/settings"
          className="text-accent-green hover:underline underline-offset-2"
        >
          upgrade to unlock
        </Link>
      </span>
    </div>
  );
}
