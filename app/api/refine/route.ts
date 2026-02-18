import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/refinery/pipeline";

export async function POST(request: NextRequest) {
  try {
    // Bearer token auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const expectedToken = process.env.PIPELINE_BEARER_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runPipeline();

    return NextResponse.json({
      message: "Pipeline completed",
      run: result.run,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("concurrent execution")) {
      return NextResponse.json(
        { error: "Pipeline already running" },
        { status: 409 }
      );
    }

    console.error("Pipeline error:", err);
    return NextResponse.json(
      { error: "Pipeline failed", details: message },
      { status: 500 }
    );
  }
}
