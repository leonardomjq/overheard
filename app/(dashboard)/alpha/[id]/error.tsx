"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

export default function AlphaDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-accent-red/10 border border-accent-red/30 rounded-full p-4 mb-4">
        <AlertTriangle className="size-8 text-accent-red" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Failed to load Alpha Card</h2>
      <p className="text-text-muted text-sm mb-6 max-w-md">
        We couldn&apos;t load this intelligence brief. It may have expired or
        there was a server error.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to feed
        </ButtonLink>
      </div>
    </div>
  );
}
