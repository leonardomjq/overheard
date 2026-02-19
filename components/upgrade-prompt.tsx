"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "./toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UpgradePrompt() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast("Could not start checkout. Please try again.", "error");
        setLoading(false);
      }
    } catch {
      toast("Could not start checkout. Please try again.", "error");
      setLoading(false);
    }
  }

  return (
    <Card padding="spacious" className="text-center max-w-sm">
      <div className="flex items-center justify-center gap-2 text-accent-green text-2xl mb-2">
        <Sparkles className="size-5" />
        <span>Pro</span>
      </div>
      <h3 className="font-semibold mb-2">Unlock Full Intelligence</h3>
      <p className="text-text-muted text-sm mb-4">
        Get complete thesis, strategy, risk analysis, and evidence for every
        Alpha Card.
      </p>
      <Button onClick={handleUpgrade} disabled={loading}>
        {loading ? "Loading..." : "Upgrade to Pro"}
      </Button>
    </Card>
  );
}
