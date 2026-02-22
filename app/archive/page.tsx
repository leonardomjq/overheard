import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CardGrid } from "@/components/card-grid";
import { getAllDates, getDailyData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse all past opportunity briefs by date.",
};

export default function ArchivePage() {
  const dates = getAllDates();

  if (dates.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <p className="text-text-muted font-mono text-sm">
            No archived cards yet.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-10">
          Archive
        </h1>

        <div className="space-y-16">
          {dates.map((date) => {
            const data = getDailyData(date);
            if (!data) return null;

            return (
              <section key={date}>
                <h2 className="font-mono text-sm text-text-muted mb-6">
                  {date} &middot; {data.cards.length} cards
                </h2>
                <CardGrid cards={data.cards} />
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
