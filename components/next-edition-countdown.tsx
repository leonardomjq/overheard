"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

function getSecondsUntilNext8AM(): number {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const utcS = now.getUTCSeconds();
  const secondsSinceMidnight = utcH * 3600 + utcM * 60 + utcS;
  const target = 8 * 3600; // 8 AM UTC in seconds
  const diff = target - secondsSinceMidnight;
  return diff > 0 ? diff : diff + 24 * 3600;
}

/** Minutes past 8 AM UTC right now (negative if before 8 AM). */
function minutesPast8AM(): number {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  return (utcH - 8) * 60 + utcM;
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 15 * 60) return "Arriving...";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function NextEditionCountdown() {
  const [seconds, setSeconds] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const reloadedRef = useRef(false);

  useEffect(() => {
    setSeconds(getSecondsUntilNext8AM());
    const interval = setInterval(() => {
      setSeconds(getSecondsUntilNext8AM());

      // Auto-reload once 12-30 min after 8 AM UTC (pipeline + deploy buffer)
      const past = minutesPast8AM();
      if (past >= 12 && past <= 30 && !reloadedRef.current) {
        reloadedRef.current = true;
        setRefreshing(true);
        window.location.reload();
      }
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  if (seconds === null) return null;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-text-muted">
        <Clock className="size-3.5 text-text-dim" />
        <span>Next edition</span>
      </div>
      <span className="font-mono text-xs text-accent-muted">
        {refreshing ? "Refreshing..." : formatCountdown(seconds)}
      </span>
    </div>
  );
}
