import { getStripe } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createOrGetCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("user_profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

export async function handleSubscriptionChange(
  subscriptionId: string,
  customerId: string,
  status: string,
  priceId: string,
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean
): Promise<void> {
  const supabase = createAdminClient();

  // Find user by stripe_customer_id
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    throw new Error(`No user found for Stripe customer ${customerId}`);
  }

  // Map Stripe status to our status
  const mappedStatus = mapStripeStatus(status);

  // Upsert subscription
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: profile.id,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: mappedStatus,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      cancel_at_period_end: cancelAtPeriodEnd,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`);

  // Update user tier
  const newTier = mappedStatus === "active" || mappedStatus === "trialing" ? "pro" : "free";
  await supabase.from("user_profiles").update({ tier: newTier }).eq("id", profile.id);
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    unpaid: "past_due",
  };
  return statusMap[stripeStatus] ?? "canceled";
}
