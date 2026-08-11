export interface GmgnToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceUsd: string;
  mc: number;
  athMc: number;
  liquidity: number;
  volume1h: number;
  volume24h: number;
  txns1h: { buys: number; sells: number };
  holders: number;
  age: string;
  ageMs: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  chainId: string;
  dexId: string;
  pairAddress: string;
  pairCreatedAt: number;
  fdv: number;
  devHolding?: number;
  sniperHolding?: number;
  insiderHolding?: number;
  top10Holding?: number;
  bluechipHolding?: number;
  totalFees?: number;
  ctoFlag?: boolean;
  createdMs: number;
  // Pump.fun specific
  bondingProgress?: number;
  stage?: 'new' | 'bonding' | 'migrated';
}
