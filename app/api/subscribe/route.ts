import { NextResponse } from "next/server";
import { SubscribeInputSchema } from "@/schemas/card";
import { getSubscriber, setSubscriber, checkRateLimit } from "@/lib/kv";

const MAX_BODY_SIZE = 1024; // 1 KB

export async function POST(request: Request) {
  try {
    // Body size check
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { ok: false, error: "Request too large." },
        { status: 413 },
      );
    }

    // Rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() ?? "unknown";
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    // Parse and validate
    const body: unknown = await request.json();
    const result = SubscribeInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400 },
      );
    }

    const email = result.data.email.trim().toLowerCase();

    // Dedup check
    const existing = await getSubscriber(email);
    if (existing) {
      return NextResponse.json({ ok: true });
    }

    await setSubscriber(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 },
    );
  }
}
