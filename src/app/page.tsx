"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, TrendingUp, Coins, Zap, RefreshCw, ExternalLink, ChevronRight, DollarSign, BarChart3, Clock } from "lucide-react";
import type { DexToken } from "@/lib/dexscreener";

function fmt(n: number | undefined, decimals = 2): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

function PriceChange({ pct }: { pct: number }) {
  const isUp = pct >= 0;
  return (
    <span className={isUp ? "text-green-400" : "text-red-400"}>
      {isUp ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

export default function HomePage() {
  const [tokens, setTokens] = useState<DexToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DexToken[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens/trending");
      const data = await res.json();
      if (Array.isArray(data)) setTokens(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults((data.pairs || []).filter((p: DexToken) => p.chainId === "solana"));
      } catch {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const stats = {
    total: tokens.length,
    volume24h: tokens.reduce((s, t) => s + (t.volume?.h24 || 0), 0),
    gainers: tokens.filter(t => (t.priceChange?.h24 || 0) > 0).length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-mono">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#1e1e24] bg-[#0a0a0b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold text-sm">G</div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">GMGN Dashboard</h1>
              <p className="text-[10px] text-zinc-500">Meme Coin Scanner</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative flex-1 max-w-md mx-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search token address or symbol..."
              className="w-full bg-[#111114] border border-[#1e1e24] rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50"
            />
            {/* Search dropdown */}
            {searchResults.length > 0 && search.trim() && (
              <div className="absolute top-full mt-1 w-full bg-[#111114] border border-[#1e1e24] rounded-lg max-h-80 overflow-y-auto z-50">
                {searchResults.slice(0, 10).map(t => (
                  <a key={t.pairAddress} href={`/token/${t.baseToken.address}`}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 border-b border-[#1e1e24] last:border-0 text-xs">
                    <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold text-[10px]">
                      {t.baseToken.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-zinc-200 truncate">{t.baseToken.name}</div>
                      <div className="text-zinc-500 text-[10px]">{t.baseToken.symbol} · {t.chainId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-200">${parseFloat(t.priceUsd).toFixed(t.priceUsd.length > 6 ? 6 : 4)}</div>
                      <PriceChange pct={t.priceChange?.h24 || 0} />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button onClick={fetchTokens} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-[#1e1e24] bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
            <span>Live</span>
          </div>
          <div className="text-zinc-600">|</div>
          <div><span className="text-zinc-200 font-bold">{stats.total}</span> tokens</div>
          <div><span className="text-zinc-200 font-bold">{fmt(stats.volume24h)}</span> 24h volume</div>
          <div><span className="text-green-400 font-bold">{stats.gainers}</span> gainers</div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <TokenCard key={token.pairAddress} token={token} />
            ))}
          </div>
        )}

        {!loading && tokens.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <Zap size={48} className="mx-auto mb-4 text-zinc-700" />
            <p className="text-sm">No tokens found</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e24] py-4 text-center text-[10px] text-zinc-600">
        Powered by DexScreener API · Data updates every 30s
      </footer>
    </div>
  );
}

function TokenCard({ token }: { token: DexToken }) {
  const change24h = token.priceChange?.h24 || 0;
  const isUp = change24h >= 0;

  return (
    <a href={`/token/${token.baseToken.address}`}
      className="group bg-[#111114] border border-[#1e1e24] rounded-xl p-4 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)] transition-all duration-200">
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {token.baseToken.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{token.baseToken.symbol}</div>
            <div className="text-[10px] text-zinc-500 truncate">{token.baseToken.name}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-white">
            ${parseFloat(token.priceUsd).toFixed(token.priceUsd.length > 6 ? 6 : 4)}
          </div>
          <div className={`text-[10px] font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
            {isUp ? "+" : ""}{change24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-zinc-900/50 rounded-lg p-2">
          <div className="text-zinc-500">24h Volume</div>
          <div className="text-zinc-200 font-medium">{fmt(token.volume?.h24 || 0)}</div>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-2">
          <div className="text-zinc-500">Liquidity</div>
          <div className="text-zinc-200 font-medium">{fmt(token.liquidity?.usd || 0)}</div>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-2">
          <div className="text-zinc-500">Market Cap</div>
          <div className="text-zinc-200 font-medium">{fmt(token.marketCap || 0)}</div>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-2">
          <div className="text-zinc-500">Buys / Sells</div>
          <div className="text-zinc-200 font-medium">
            <span className="text-green-400">{fmtNum(token.txns?.h24?.buys || 0)}</span>
            {" / "}
            <span className="text-red-400">{fmtNum(token.txns?.h24?.sells || 0)}</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1e1e24]">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400">{token.chainId}</span>
          <span>{token.dexId}</span>
        </div>
        <ChevronRight size={14} className="text-zinc-600 group-hover:text-green-400 transition-colors" />
      </div>
    </a>
  );
}
