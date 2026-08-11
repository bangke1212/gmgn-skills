"use client";

import { useState, useEffect } from "react";
import { X, Copy, ExternalLink, Check, ShoppingCart, Shield, Users, TrendingUp, DollarSign, Clock, Globe, Send, Flame } from "lucide-react";

export interface ModalToken {
  address: string;
  symbol: string;
  name: string;
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
  createdMs: number;
  stage?: string;
  socials?: { twitter?: string | null; telegram?: string | null; website?: string | null };
  creator?: string | null;
  imageUri?: string | null;
  replyCount?: number;
  bondingProgress?: number;
}

export default function TokenModal({ token, onClose }: { token: ModalToken; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/tokens/info?mint=${token.address}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token.address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bondPct = token.bondingProgress || 0;
  const isPump = token.stage === 'new' || token.stage === 'bonding';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d10] border border-[#2a2a35] rounded-xl w-[420px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0d0d10] border-b border-[#1a1a20] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {token.imageUri ? (
              <img src={token.imageUri} className="w-10 h-10 rounded-full" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">{token.symbol?.[0]}</div>
            )}
            <div>
              <h2 className="text-white font-bold text-sm">{token.symbol}</h2>
              <p className="text-zinc-500 text-[11px]">{token.name?.slice(0, 30)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          {/* Contract Address */}
          <div className="bg-[#111114] border border-[#1a1a20] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Contract Address</span>
              <button onClick={copyAddress} className="flex items-center gap-1 text-zinc-500 hover:text-green-400 text-[10px]">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-zinc-300 text-[12px] font-mono break-all">{token.address}</p>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <DollarSign size={12} />, label: "MC", value: token.mc ? `$${token.mc.toFixed(2)}` : "—", color: "text-green-400" },
              { icon: <TrendingUp size={12} />, label: "ATH MC", value: token.athMc ? `$${token.athMc.toFixed(2)}` : "—", color: "text-blue-400" },
              { icon: <Clock size={12} />, label: "Age", value: token.age, color: "text-zinc-400" },
              { icon: <Shield size={12} />, label: "Liq", value: token.liquidity ? `$${token.liquidity.toFixed(0)}` : "—", color: "text-yellow-400" },
              { icon: <Users size={12} />, label: "Holders", value: String(token.holders || "—"), color: "text-purple-400" },
              { icon: <Flame size={12} />, label: "Stage", value: token.stage || "—", color: token.stage === 'new' ? 'text-cyan-400' : 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#111114] border border-[#1a1a20] rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-zinc-500 text-[9px] mb-1">{s.icon}<span>{s.label}</span></div>
                <div className={`${s.color} text-[12px] font-semibold tabular-nums`}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* Bonding Progress */}
          {isPump && bondPct > 0 && (
            <div className="bg-[#111114] border border-[#1a1a20] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Bonding Curve</span>
                <span className="text-orange-400 text-[11px] font-semibold">{bondPct}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: `${bondPct}%` }} />
              </div>
              {detail?.pump && (
                <div className="flex justify-between mt-2 text-[9px] text-zinc-500">
                  <span>Real SOL: {detail.pump.real_sol_reserves ? (detail.pump.real_sol_reserves / 1e9).toFixed(2) : "—"} SOL</span>
                  <span>Virtual SOL: {detail.pump.virtual_sol_reserves ? (detail.pump.virtual_sol_reserves / 1e9).toFixed(2) : "—"} SOL</span>
                </div>
              )}
            </div>
          )}
          {/* DEX Info */}
          {detail?.pair && (
            <div className="bg-[#111114] border border-[#1a1a20] rounded-lg p-3">
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-2">DEX Pair Info</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-zinc-500">DEX</span><span className="text-zinc-300">{detail.pair.dexId}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Price</span><span className="text-zinc-300">${Number(detail.pair.priceUsd).toFixed(8)}</span></div>
                {detail.pair.priceChange?.h24 && <div className="flex justify-between"><span className="text-zinc-500">24h Change</span><span className={detail.pair.priceChange.h24 >= 0 ? "text-green-400" : "text-red-400"}>{detail.pair.priceChange.h24.toFixed(2)}%</span></div>}
                <div className="flex justify-between"><span className="text-zinc-500">24h Volume</span><span className="text-zinc-300">${Number(detail.pair.volume?.h24 || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">LP Locked</span><span className="text-zinc-300">{detail.pair.lpLocked ? "✅ Yes" : "⚠️ Unknown"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">DexScreener</span><a href={detail.pair.url} target="_blank" rel="noopener" className="text-blue-400 hover:underline">Open ↗</a></div>
              </div>
            </div>
          )}
          {/* Socials */}
          {(token.socials?.twitter || token.socials?.telegram || token.socials?.website) && (
            <div className="bg-[#111114] border border-[#1a1a20] rounded-lg p-3">
              <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-2">Socials</span>
              <div className="flex gap-2">
                {token.socials.twitter && <a href={token.socials.twitter} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 text-[11px]"><X size={12} className="text-blue-400" /> Twitter</a>}
                {token.socials.telegram && <a href={token.socials.telegram} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 text-[11px]"><Send size={12} className="text-blue-400" /> Telegram</a>}
                {token.socials.website && <a href={token.socials.website} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 text-[11px]"><Globe size={12} className="text-green-400" /> Website</a>}
              </div>
            </div>
          )}
        </div>
        {/* Buy Footer */}
        <div className="sticky bottom-0 bg-[#0d0d10] border-t border-[#1a1a20] p-4 flex gap-2">
          {isPump ? (
            <a href={`https://pump.fun/coin/${token.address}`} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold text-[12px] rounded-lg transition-all">
              <ShoppingCart size={14} /> Buy on Pump.fun
            </a>
          ) : (
            <a href={`https://jup.ag/swap/SOL-${token.address}`} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold text-[12px] rounded-lg transition-all">
              <ShoppingCart size={14} /> Buy on Jupiter
            </a>
          )}
          <a href={`https://dexscreener.com/solana/${token.pairAddress || token.address}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#2a2a35] hover:border-zinc-400 text-zinc-400 hover:text-white text-[11px] rounded-lg transition-all">
            <ExternalLink size={12} /> Chart
          </a>
        </div>
      </div>
    </div>
  );
}
