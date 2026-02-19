import { Card } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card className="space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-24 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-14 bg-surface-elevated rounded-full animate-pulse" />
      </div>
      <div className="h-5 w-3/4 bg-surface-elevated rounded animate-pulse" />
      <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
      <div className="flex gap-1.5">
        <div className="h-5 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-20 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-14 bg-surface-elevated rounded animate-pulse" />
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
      </div>
    </Card>
  );
}
