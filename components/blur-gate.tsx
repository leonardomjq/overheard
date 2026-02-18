"use client";

import { UpgradePrompt } from "./upgrade-prompt";

interface BlurGateProps {
  isLocked: boolean;
  children: React.ReactNode;
}

export function BlurGate({ isLocked, children }: BlurGateProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none" aria-hidden>
        {/* Placeholder content — real pro data is never sent to free users */}
        <div className="space-y-3">
          <div className="h-4 bg-surface-elevated rounded w-3/4" />
          <div className="h-4 bg-surface-elevated rounded w-full" />
          <div className="h-4 bg-surface-elevated rounded w-5/6" />
          <div className="h-4 bg-surface-elevated rounded w-2/3" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradePrompt />
      </div>
    </div>
  );
}
