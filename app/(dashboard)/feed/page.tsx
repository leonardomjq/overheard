import { Suspense } from "react";
import { AlphaFeed } from "@/components/alpha-feed";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Alpha Feed</h1>
      </div>
      <Suspense>
        <AlphaFeed />
      </Suspense>
    </div>
  );
}
