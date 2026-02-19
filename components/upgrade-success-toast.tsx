"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast";

export function UpgradeSuccessToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true" && searchParams.get("session_id")) {
      toast("Welcome to Pro! Your upgrade is active.", "success");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, toast]);

  return null;
}
