import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gateAlphaCard } from "@/lib/refinery/gate";
import type { AlphaCard, AlphaTier } from "@/types";

export async function GET(request: NextRequest) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
    const category = searchParams.get("category");
    const direction = searchParams.get("direction");

    // Build query
    let query = supabase
      .from("alpha_cards")
      .select("*")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit + 1); // +1 to detect next page

    if (cursor) {
      query = query.lt("id", cursor);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (direction) {
      query = query.eq("direction", direction);
    }

    const { data: cards, error: queryError } = await query;

    if (queryError) {
      console.error("Query error:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch alphas" },
        { status: 500 }
      );
    }

    const hasMore = (cards?.length ?? 0) > limit;
    const items = (cards ?? []).slice(0, limit);

    // Apply tier gating
    const gatedCards = items.map((card) =>
      gateAlphaCard(card as unknown as AlphaCard, tier)
    );

    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      data: gatedCards,
      cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (err) {
    console.error("Alphas error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
