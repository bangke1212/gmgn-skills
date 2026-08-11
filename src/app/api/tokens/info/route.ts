import { getTokenInfo } from "@/lib/dexscreener";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
  
  try {
    const token = await getTokenInfo(address);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 404 });
    return NextResponse.json(token);
  } catch {
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}
