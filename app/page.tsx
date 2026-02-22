import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardGrid } from "@/components/card-grid";
import { getLatestData } from "@/lib/data";

export default function HomePage() {
  const data = getLatestData();

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <p className="text-text-muted font-mono text-sm">
            No cards yet. Check back tomorrow.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const uniqueSources = new Set(data.cards.flatMap((c) => c.sources));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* Date header */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
            Today&apos;s Opportunities
          </h1>
          <p className="text-text-muted text-sm font-mono">
            {data.date} &middot; {data.cards.length} cards &middot;{" "}
            {uniqueSources.size} sources
          </p>
        </div>

        <CardGrid cards={data.cards} />
      </main>
      <SiteFooter />
    </div>
  );
}
