"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Activity, Wallet, DollarSign, Clock, BarChart3, Shield, Layers } from "lucide-react";
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

export default function TokenDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<DexToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/tokens/info?address=${address}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setToken(data);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return <LoadingSkeleton />;
  if (error || !token) return <NotFound address={address} />;

  const change24h = token.priceChange?.h24 || 0;
  const isUp = change24h >= 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-mono">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#1e1e24] bg-[#0a0a0b]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-all">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {token.baseToken.symbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{token.baseToken.name}</h1>
              <p className="text-[10px] text-zinc-500">{token.baseToken.symbol} · {token.chainId}</p>
            </div>
          </div>
          <a href={`https://dexscreener.com/${token.chainId}/${token.pairAddress}`} target="_blank" rel="noopener"
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-all">
            View on DexScreener <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Price Header */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">
                ${parseFloat(token.priceUsd).toFixed(token.priceUsd.length > 6 ? 8 : 4)}
              </div>
              <div className={`text-sm font-medium mt-1 ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                {isUp ? "+" : ""}{change24h.toFixed(2)}% (24h)
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <a href={`https://birdeye.so/token/${token.baseToken.address}?chain=${token.chainId}`} target="_blank" rel="noopener"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                <Activity size={14} /> BirdEye
              </a>
            </div>
          </div>

          {/* Price Changes */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "5m", val: token.priceChange?.m5 },
              { label: "1h", val: token.priceChange?.h1 },
              { label: "6h", val: token.priceChange?.h6 },
              { label: "24h", val: token.priceChange?.h24 },
            ].map(({ label, val }) => (
              <div key={label} className="bg-zinc-900/50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
                <div className={`text-sm font-bold ${(val || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {(val || 0) >= 0 ? "+" : ""}{(val || 0).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox icon={<BarChart3 size={16} />} label="24h Volume" value={fmt(token.volume?.h24 || 0)} color="text-blue-400" />
          <StatBox icon={<Layers size={16} />} label="Liquidity" value={fmt(token.liquidity?.usd || 0)} color="text-purple-400" />
          <StatBox icon={<DollarSign size={16} />} label="Market Cap" value={fmt(token.marketCap || 0)} color="text-green-400" />
          <StatBox icon={<DollarSign size={16} />} label="FDV" value={fmt(token.fdv || 0)} color="text-yellow-400" />
        </div>

        {/* Trading Activity */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-zinc-500" /> Trading Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Buys (24h)", val: token.txns?.h24?.buys || 0, up: true },
              { label: "Sells (24h)", val: token.txns?.h24?.sells || 0, up: false },
              { label: "Volume 1h", val: token.volume?.h1 || 0 },
              { label: "Volume 6h", val: token.volume?.h6 || 0 },
            ].map(({ label, val, up }) => (
              <div key={label} className="bg-zinc-900/50 rounded-lg p-3">
                <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
                <div className={`text-sm font-bold ${up === true ? "text-green-400" : up === false ? "text-red-400" : "text-zinc-200"}`}>
                  {up !== undefined ? fmtNum(val) : fmt(val)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pair Info */}
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-zinc-500" /> Pair Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <InfoRow label="Network" value={token.chainId.toUpperCase()} />
            <InfoRow label="DEX" value={token.dexId} />
            <InfoRow label="Pair" value={token.pairAddress} mono />
            <InfoRow label="Base Token" value={token.baseToken.address} mono />
            <InfoRow label="Quote Token" value={token.quoteToken.symbol} />
            <InfoRow label="Created" value={new Date(token.pairCreatedAt).toLocaleDateString()} />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
      <div className="text-sm font-bold text-zinc-200">{value}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center bg-zinc-900/50 rounded-lg px-3 py-2">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-zinc-300 ${mono ? "font-mono text-[10px]" : ""}`}>
        {mono ? `${value.slice(0, 6)}...${value.slice(-4)}` : value}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="h-14 border-b border-[#1e1e24]" />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-6 animate-pulse h-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111114] border border-[#1e1e24] rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
        <div className="bg-[#111114] border border-[#1e1e24] rounded-xl p-5 animate-pulse h-32" />
      </div>
    </div>
  );
}

function NotFound({ address }: { address: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <TrendingDown size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Token Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-md mb-4">
          No data found for <code className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{address.slice(0, 10)}...{address.slice(-6)}</code>
        </p>
        <a href="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-all">
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>
    </div>
  );
}
