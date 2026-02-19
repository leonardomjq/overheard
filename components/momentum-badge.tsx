import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface MomentumBadgeProps {
  score: number;
  direction: "rising" | "falling" | "stable";
}

const directionVariant: Record<string, BadgeProps["variant"]> = {
  rising: "success",
  falling: "danger",
  stable: "warning",
};

const directionIcon: Record<string, typeof ArrowUp> = {
  rising: ArrowUp,
  falling: ArrowDown,
  stable: ArrowRight,
};

export function MomentumBadge({ score, direction }: MomentumBadgeProps) {
  const Icon = directionIcon[direction];
  return (
    <Badge variant={directionVariant[direction]} shape="pill">
      <Icon className="size-3" /> {Math.round(score)}
    </Badge>
  );
}
