interface MomentumBadgeProps {
  score: number;
  direction: "rising" | "falling" | "stable";
}

export function MomentumBadge({ score, direction }: MomentumBadgeProps) {
  const colorClass =
    direction === "rising"
      ? "text-accent-green border-accent-green/30 bg-accent-green/10"
      : direction === "falling"
        ? "text-accent-red border-accent-red/30 bg-accent-red/10"
        : "text-accent-amber border-accent-amber/30 bg-accent-amber/10";

  const arrow =
    direction === "rising" ? "\u2191" : direction === "falling" ? "\u2193" : "\u2192";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono border ${colorClass}`}
    >
      {arrow} {Math.round(score)}
    </span>
  );
}
