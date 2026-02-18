import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gateAlphaCard } from "@/lib/refinery/gate";
import type { AlphaCard, AlphaTier } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user tier
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("tier")
      .eq("id", user.id)
      .single();

    const tier: AlphaTier = (profile?.tier as AlphaTier) ?? "free";

    // Fetch card
    const { data: card, error: queryError } = await supabase
      .from("alpha_cards")
      .select("*")
      .eq("id", id)
      .single();

    if (queryError || !card) {
      return NextResponse.json(
        { error: "Alpha card not found" },
        { status: 404 }
      );
    }

    // Apply tier gating
    const gatedCard = gateAlphaCard(card as unknown as AlphaCard, tier);

    return NextResponse.json({ data: gatedCard });
  } catch (err) {
    console.error("Alpha detail error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
