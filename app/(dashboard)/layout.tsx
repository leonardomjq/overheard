import { Suspense } from "react";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { getUserTier } from "@/lib/appwrite/helpers";
import { DashboardShell } from "@/components/dashboard-shell";
import { UpgradeSuccessToast } from "@/components/upgrade-success-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tier: "free" | "pro" = "free";

  try {
    const user = await getLoggedInUser();
    if (user) {
      const { databases } = createAdminClient();
      tier = await getUserTier(user.$id, databases);
    }
  } catch {
    // Fall back to free if user fetch fails
  }

  return (
    <DashboardShell tier={tier}>
      <Suspense>
        <UpgradeSuccessToast />
      </Suspense>
      {children}
    </DashboardShell>
  );
}
