const BASE = "https://api.dexscreener.com/latest/dex";

export interface DexToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  priceChange: { h24: number; h6: number; h1: number; m5: number };
  volume: { h24: number; h6: number; h1: number; m5: number };
  liquidity: { usd: number };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  txns: { h24: { buys: number; sells: number } };
}

export async function searchTokens(query: string): Promise<DexToken[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, { next: { revalidate: 30 } });
  const data = await res.json();
  return (data.pairs || []) as DexToken[];
}

export async function getTokenInfo(address: string, chain: string = "solana"): Promise<DexToken | null> {
  const res = await fetch(`${BASE}/tokens/${address}`, { next: { revalidate: 30 } });
  const data = await res.json();
  if (!data.pairs || data.pairs.length === 0) return null;
  return data.pairs.find((p: DexToken) => p.chainId === chain) || data.pairs[0] as DexToken;
}

export async function getTrendingTokens(): Promise<DexToken[]> {
  const res = await fetch(`${BASE}/search?q=sol`, { next: { revalidate: 30 } });
  const data = await res.json();
  return ((data.pairs || []) as DexToken[])
    .filter((p: DexToken) => p.chainId === "solana" && p.liquidity?.usd > 5000)
    .sort((a: DexToken, b: DexToken) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .slice(0, 50);
}
