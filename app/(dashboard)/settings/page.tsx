import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UpgradePrompt } from "@/components/upgrade-prompt";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const tier = profile?.tier ?? "free";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Account */}
      <section className="bg-surface border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Tier</span>
            <span
              className={
                tier === "pro" ? "text-accent-green font-semibold" : ""
              }
            >
              {tier === "pro" ? "Pro" : "Free"}
            </span>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Status</span>
              <span className="text-accent-green">{subscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Current period ends</span>
              <span>
                {new Date(
                  subscription.current_period_end
                ).toLocaleDateString()}
              </span>
            </div>
            {subscription.cancel_at_period_end && (
              <p className="text-accent-amber text-xs">
                Subscription will cancel at the end of the current period.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-text-muted text-sm mb-4">
              You&apos;re on the free tier. Upgrade to unlock full intelligence
              briefs.
            </p>
            <UpgradePrompt />
          </div>
        )}
      </section>
    </div>
  );
}
