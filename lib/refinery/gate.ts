import type { AlphaCard, AlphaTier } from "@/types";

const PRO_FIELDS = [
  "thesis",
  "strategy",
  "risk_factors",
  "evidence",
  "friction_detail",
  "opportunity_window",
  "blueprint",
] as const;

export function gateAlphaCard(card: AlphaCard, tier: AlphaTier): AlphaCard {
  if (tier === "pro") return card;
  const gated = { ...card };
  for (const field of PRO_FIELDS) {
    gated[field] = null;
  }
  return gated;
}
