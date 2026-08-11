import { getTrendingTokens } from "@/lib/dexscreener";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tokens = await getTrendingTokens();
    return NextResponse.json(tokens);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch trending tokens" }, { status: 500 });
  }
}
