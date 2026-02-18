"use client";

import { useState } from "react";

export function UpgradePrompt() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 text-center max-w-sm">
      <div className="text-accent-green text-2xl mb-2">Pro</div>
      <h3 className="font-semibold mb-2">Unlock Full Intelligence</h3>
      <p className="text-text-muted text-sm mb-4">
        Get complete thesis, strategy, risk analysis, and evidence for every
        Alpha Card.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-accent-green text-bg px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Loading..." : "Upgrade to Pro"}
      </button>
    </div>
  );
}
