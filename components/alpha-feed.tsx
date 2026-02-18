"use client";

import useSWRInfinite from "swr/infinite";
import { AlphaCard } from "./alpha-card";
import type { AlphaCard as AlphaCardType, AlphaCategory, AlphaDirection } from "@/types";
import { useState } from "react";

interface AlphaResponse {
  data: AlphaCardType[];
  cursor: string | null;
  has_more: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORIES: Array<{ value: AlphaCategory | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "momentum_shift", label: "Momentum" },
  { value: "friction_opportunity", label: "Friction" },
  { value: "emerging_tool", label: "Emerging" },
  { value: "contrarian_signal", label: "Contrarian" },
];

const DIRECTIONS: Array<{ value: AlphaDirection | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "rising", label: "Rising" },
  { value: "falling", label: "Falling" },
  { value: "stable", label: "Stable" },
];

export function AlphaFeed() {
  const [category, setCategory] = useState<string>("");
  const [direction, setDirection] = useState<string>("");

  const getKey = (pageIndex: number, previousPageData: AlphaResponse | null) => {
    if (previousPageData && !previousPageData.has_more) return null;
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (category) params.set("category", category);
    if (direction) params.set("direction", direction);
    if (previousPageData?.cursor) params.set("cursor", previousPageData.cursor);
    return `/api/alphas?${params.toString()}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<AlphaResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
    });

  const cards = data?.flatMap((page) => page.data) ?? [];
  const hasMore = data?.[data.length - 1]?.has_more ?? false;
  const isEmpty = data?.[0]?.data?.length === 0;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">Category:</span>
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  category === cat.value
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-surface text-text-muted border border-border hover:border-accent-green/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-sm">Direction:</span>
          <div className="flex gap-1">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir.value}
                onClick={() => setDirection(dir.value)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  direction === dir.value
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-surface text-text-muted border border-border hover:border-accent-green/20"
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
          Failed to load alpha cards. Please try again.
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !isValidating && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No alpha cards yet</p>
          <p className="text-sm">
            New intelligence briefs are generated every pipeline cycle.
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <AlphaCard key={card.id} card={card} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setSize(size + 1)}
            disabled={isValidating}
            className="bg-surface border border-border px-6 py-2 rounded-lg text-sm hover:border-accent-green/30 transition-colors disabled:opacity-50"
          >
            {isValidating ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
