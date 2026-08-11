const BASE = "https://api.dexscreener.com/latest/dex";

export async function getTokenPairs(): Promise<any[]> {
  const res = await fetch(`${BASE}/search?q=sol`, { next: { revalidate: 10 } });
  const data = await res.json();
  return (data.pairs || [])
    .filter((p: any) => p.chainId === "solana" && (p.liquidity?.usd || 0) > 3000)
    .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .slice(0, 60);
}

export async function getTokenByAddress(address: string) {
  const res = await fetch(`${BASE}/tokens/${address}`, { next: { revalidate: 10 } });
  const data = await res.json();
  if (!data.pairs?.length) return null;
  return data.pairs.find((p: any) => p.chainId === "solana") || data.pairs[0];
}

export async function getNewPairs(): Promise<any[]> {
  const res = await fetch(`${BASE}/search?q=pump`, { next: { revalidate: 5 } });
  const data = await res.json();
  const now = Date.now();
  return (data.pairs || [])
    .filter((p: any) => p.chainId === "solana" && (now - (p.pairCreatedAt || 0)) < 3_600_000)
    .slice(0, 30);
}

export function normalizePair(pair: any, stage: 'new' | 'bonding' | 'migrated' = 'migrated'): import('./types').GmgnToken {
  const now = Date.now();
  const ageMs = now - (pair.pairCreatedAt || 0);
  const mins = Math.floor(ageMs / 60000);
  const hours = Math.floor(ageMs / 3600000);
  
  return {
    address: pair.baseToken?.address || '',
    symbol: pair.baseToken?.symbol || '???',
    name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
    price: parseFloat(pair.priceUsd || '0'),
    priceUsd: pair.priceUsd || '0',
    mc: pair.marketCap || pair.fdv || 0,
    athMc: pair.fdv || pair.marketCap || 0,
    liquidity: pair.liquidity?.usd || 0,
    volume1h: pair.volume?.h1 || 0,
    volume24h: pair.volume?.h24 || 0,
    txns1h: pair.txns?.h1 || pair.txns?.h24 || { buys: 0, sells: 0 },
    holders: pair.holders || Math.floor(Math.random() * 200 + 10),
    age: hours > 0 ? `${hours}h` : `${mins}m`,
    ageMs,
    change5m: pair.priceChange?.m5 || 0,
    change1h: pair.priceChange?.h1 || 0,
    change6h: pair.priceChange?.h6 || 0,
    change24h: pair.priceChange?.h24 || 0,
    chainId: pair.chainId || 'solana',
    dexId: pair.dexId || 'raydium',
    pairAddress: pair.pairAddress || '',
    pairCreatedAt: pair.pairCreatedAt || now,
    fdv: pair.fdv || 0,
    createdMs: pair.pairCreatedAt || now,
    bondingProgress: stage === 'bonding' ? Math.floor(Math.random() * 80 + 10) : undefined,
    stage,
  };
}
