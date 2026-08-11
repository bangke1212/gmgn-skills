import { getTokenPairs, getNewPairs, normalizePair } from "@/lib/dexscreener";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [pairs, newPairs] = await Promise.all([getTokenPairs(), getNewPairs()]);
    
    const migrated = pairs.slice(0, 20).map((p: any) => normalizePair(p, 'migrated'));
    const bonding = pairs.slice(10, 30).map((p: any) => normalizePair(p, 'bonding'));
    const fresh = newPairs.slice(0, 15).map((p: any) => normalizePair(p, 'new'));
    
    return NextResponse.json({ fresh, bonding, migrated });
  } catch {
    return NextResponse.json({ fresh: [], bonding: [], migrated: [] });
  }
}
