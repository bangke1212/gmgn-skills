import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get("mint");
  if (!mint) return NextResponse.json({ error: "mint required" }, { status: 400 });
  
  try {
    const [pumpRes, dexRes] = await Promise.all([
      fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, { cache: "no-store" }),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: "no-store" })
    ]);
    
    const pumpData = pumpRes.ok ? await pumpRes.json() : null;
    const dexData = dexRes.ok ? await dexRes.json() : null;
    const pair = dexData?.pairs?.find((p: any) => p.chainId === "solana") || dexData?.pairs?.[0];

    return NextResponse.json({
      mint,
      pump: pumpData,
      pair: pair ? {
        priceUsd: pair.priceUsd,
        priceChange: pair.priceChange,
        liquidity: pair.liquidity,
        volume: pair.volume,
        txns: pair.txns,
        marketCap: pair.marketCap || pair.fdv,
        pairAddress: pair.pairAddress,
        dexId: pair.dexId,
        url: pair.url,
        holders: pair.holders,
        lpLocked: pair.lpLocked,
        verified: pair.moonshot,
      } : null
    });
  } catch {
    return NextResponse.json({ mint, error: "Failed to fetch" }, { status: 500 });
  }
}
