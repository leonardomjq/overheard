import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { handleSubscriptionChange } from "@/lib/stripe/helpers";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const item = subscription.items.data[0];

        // Extract period timestamps — handle both old and new Stripe SDK shapes
        const sub = subscription as unknown as Record<string, unknown>;
        const periodStart = (sub.current_period_start as number) ?? Math.floor(Date.now() / 1000);
        const periodEnd = (sub.current_period_end as number) ?? Math.floor(Date.now() / 1000) + 30 * 86400;

        await handleSubscriptionChange(
          subscription.id,
          subscription.customer as string,
          subscription.status,
          item?.price?.id ?? "",
          periodStart,
          periodEnd,
          subscription.cancel_at_period_end
        );
        break;
      }
      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
