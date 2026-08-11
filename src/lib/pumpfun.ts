const PUMPFUN_API = "https://frontend-api-v3.pump.fun/coins";

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  creator: string;
  created_timestamp: number;
  market_cap: number;
  usd_market_cap: number;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: string;
  complete: boolean;
  reply_count: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  username?: string;
  profile_image?: string;
  last_trade_timestamp?: number;
  ath_market_cap?: number;
  real_sol_reserves: number;
  real_token_reserves: number;
  nsfw: boolean;
  is_banned: boolean;
  bonding_curve: string;
  associated_bonding_curve: string;
  updated_at?: number;
  verified: boolean;
}

export async function getPumpFunTokens(sort: string = "created_timestamp", limit: number = 30): Promise<PumpFunToken[]> {
  try {
    const res = await fetch(
      `${PUMPFUN_API}?offset=0&limit=${limit}&sort=${sort}&includeNsfw=false&order=DESC`,
      { next: { revalidate: 5 }, cache: "no-store" }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((t: PumpFunToken) => !t.complete && !t.nsfw && !t.is_banned);
  } catch {
    return [];
  }
}

export async function getBondingTokens(limit: number = 20): Promise<PumpFunToken[]> {
  try {
    const res = await fetch(
      `${PUMPFUN_API}?offset=0&limit=${limit}&sort=market_cap&includeNsfw=false&order=DESC`,
      { next: { revalidate: 10 }, cache: "no-store" }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((t: PumpFunToken) => !t.complete && !t.nsfw && !t.is_banned);
  } catch {
    return [];
  }
}
