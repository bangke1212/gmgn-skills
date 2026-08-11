"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, TrendingUp, Zap, RefreshCw, ChevronRight, DollarSign, Activity, Flame, Users, Clock, Fuel, Shield, Sparkles, ArrowUp, ArrowDown, Radio, ExternalLink, X, Send, Wallet } from "lucide-react";
import type { GmgnToken } from "@/lib/types";

// --- Number formatters ---
function fmt(n: number, decimals = 2): string {
  if (!n || n < 0) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}
function fmtCompact(n: number): string {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}
function fmtInt(n: number): string {
  if (!n) return "0";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}
function timeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

// --- Mini Sparkline ---
function Sparkline({ changes }: { changes: number[] }) {
  if (!changes || changes.length < 2) return null;
  const min = Math.min(...changes, 0);
  const max = Math.max(...changes, 0);
  const range = max - min || 1;
  const w = 40, h = 16;
  const points = changes.map((v, i) => `${(i / (changes.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const trend = changes[changes.length - 1] >= changes[0];
  return (
    <svg width={w} height={h} className="shrink-0 opacity-60">
      <polyline fill="none" stroke={trend ? "#22c55e" : "#ef4444"} strokeWidth="1.5" points={points} />
    </svg>
  );
}

// --- Token Row (compact, GMGN-style) ---
function TokenRow({ token, stage }: { token: GmgnToken; stage: string }) {
  const mcChange = token.mc > 0 ? ((token.mc - (token.athMc || token.mc)) / (token.athMc || token.mc)) * 100 : 0;
  const sparkData = [token.change24h || 0, token.change6h || 0, token.change1h || 0, token.change5m || 0];

  return (
    <div className="group flex items-center gap-1.5 py-2 px-2 hover:bg-white/[0.02] border-b border-[#1a1a20] last:border-0 cursor-pointer transition-colors animate-slide-up text-[11px] leading-tight">
      {/* Symbol + Name */}
      <div className="w-[90px] shrink-0">
        <div className="text-white font-semibold text-truncate">{token.symbol}</div>
        <div className="text-zinc-500 text-[10px] text-truncate">{token.name.slice(0, 12)}</div>
      </div>
      {/* Age */}
      <div className="w-[38px] shrink-0 text-zinc-400 text-right">{token.age}</div>
      {/* MC */}
      <div className="w-[75px] shrink-0 text-right">
        <div className="text-zinc-200 tabular-nums">{fmtCompact(token.mc)}</div>
        <div className={`text-[10px] ${mcChange >= 0 ? "text-green-400" : "text-red-400"}`}>
          {mcChange >= 0 ? "+" : ""}{mcChange.toFixed(1)}%
        </div>
      </div>
      {/* ATH MC */}
      <div className="w-[70px] shrink-0 text-right text-zinc-500 tabular-nums">{fmtCompact(token.athMc)}</div>
      {/* Liq */}
      <div className="w-[65px] shrink-0 text-right text-zinc-500 tabular-nums">{fmtCompact(token.liquidity)}</div>
      {/* 1h Vol */}
      <div className="w-[70px] shrink-0 text-right tabular-nums">
        <div className="text-zinc-300">{fmtCompact(token.volume1h)}</div>
      </div>
      {/* 1h TXs */}
      <div className="w-[80px] shrink-0 text-right tabular-nums">
        <div className="text-zinc-400">
          <span className="text-green-400">{fmtInt(token.txns1h?.buys || 0)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-red-400">{fmtInt(token.txns1h?.sells || 0)}</span>
        </div>
      </div>
      {/* Holders */}
      <div className="w-[48px] shrink-0 text-right text-zinc-400 tabular-nums">{token.holders}</div>
      {/* Sparkline */}
      <div className="w-[44px] shrink-0 flex justify-center"><Sparkline changes={sparkData} /></div>
      {/* Actions */}
      <div className="w-[28px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`https://dexscreener.com/solana/${token.pairAddress}`} target="_blank" rel="noopener" className="text-zinc-500 hover:text-green-400">
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

// --- Column View ---
function TokenColumn({ title, tokens, stage, icon, accent }: {
  title: string; tokens: GmgnToken[]; stage: 'new' | 'bonding' | 'migrated'; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="flex-1 min-w-0 border-r border-[#1a1a20] last:border-r-0 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a20] bg-[#0a0a0b] sticky top-0 z-10">
        <div className={`w-5 h-5 rounded flex items-center justify-center ${accent}`}>{icon}</div>
        <span className="text-white font-semibold text-xs">{title}</span>
        <span className="text-zinc-600 text-[10px]">{tokens.length}</span>
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
        </div>
      </div>
      {/* Column Header Labels */}
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-zinc-600 bg-[#0a0a0b]/50 border-b border-[#1a1a20]">
        <span className="w-[90px] shrink-0">Token</span>
        <span className="w-[38px] shrink-0 text-right">Age</span>
        <span className="w-[75px] shrink-0 text-right">MC</span>
        <span className="w-[70px] shrink-0 text-right">ATH MC</span>
        <span className="w-[65px] shrink-0 text-right">Liq</span>
        <span className="w-[70px] shrink-0 text-right">1h Vol</span>
        <span className="w-[80px] shrink-0 text-right">1h TXs</span>
        <span className="w-[48px] shrink-0 text-right">Hold</span>
        <span className="w-[44px] shrink-0"></span>
        <span className="w-[28px] shrink-0"></span>
      </div>
      {/* Token Rows */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {tokens.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-xs">No data</div>
        ) : (
          tokens.map(t => <TokenRow key={t.address + t.stage} token={t} stage={stage} />)
        )}
      </div>
    </div>
  );
}

// --- MAIN ---
export default function GmgnTrenches() {
  const [data, setData] = useState<{ fresh: GmgnToken[]; bonding: GmgnToken[]; migrated: GmgnToken[] }>({
    fresh: [], bonding: [], migrated: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'trenches'|'trending'>('trenches');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    const start = Date.now();
    try {
      const res = await fetch("/api/tokens/trending");
      const d = await res.json();
      if (d.fresh) setData(d);
    } catch {}
    setLatency(Date.now() - start);
    setLastUpdate(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  const allTokens = [...data.fresh, ...data.bonding, ...data.migrated];

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0b] text-zinc-200">
      {/* === TOP BAR === */}
      <div className="h-10 border-b border-[#1a1a20] flex items-center px-3 gap-3 bg-[#0a0a0b] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold text-[10px]">G</div>
          <span className="text-xs font-bold text-white tracking-tight">GMGN</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <button onClick={() => setActiveTab('trenches')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === 'trenches' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            Trenches
          </button>
          <button onClick={() => setActiveTab('trending')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${activeTab === 'trending' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            Trending
          </button>
          <span className="text-zinc-700 mx-1">|</span>
          <span className="px-2 py-1 rounded-md text-zinc-600">CopyTrade</span>
          <span className="px-2 py-1 rounded-md text-zinc-600">Portfolio</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-[300px] ml-auto mr-2">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by symbol / CA"
            className="w-full bg-[#111114] border border-[#1a1a20] rounded-md pl-7 pr-3 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-green-500/40"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 text-[10px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>{latency}ms</span>
          </div>
          <button onClick={fetchData} className="hover:text-white transition-colors"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /></button>
          <span>SOL $75.22</span>
        </div>
      </div>

      {/* === SIDEBAR + MAIN === */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (left panels) */}
        {sidebarOpen && (
          <div className="w-[220px] shrink-0 border-r border-[#1a1a20] bg-[#0a0a0b] flex flex-col overflow-hidden">
            {/* Track Panel */}
            <div className="border-b border-[#1a1a20]">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio size={11} className="text-green-400" />
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Track</span>
                </div>
                <span className="text-zinc-600 text-[9px]">7/10</span>
              </div>
              <div className="flex text-[10px] border-b border-[#1a1a20]">
                {['Wallet', 'Track','Callout','Monitor','Renames'].map(t => (
                  <button key={t} className="flex-1 py-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors">{t}</button>
                ))}
              </div>
              <div className="px-3 py-4 text-center text-[10px] text-zinc-600">
                <Sparkles size={14} className="mx-auto mb-1 text-zinc-700" />
                <span>Login to track wallets</span>
              </div>
            </div>
            {/* Social Tracker */}
            <div className="border-b border-[#1a1a20]">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Send size={11} className="text-blue-400" />
                  <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Social Tracker</span>
                </div>
              </div>
              <div className="flex text-[10px] border-b border-[#1a1a20]">
                {['X Tracker', 'TG Tracker'].map(t => (
                  <button key={t} className="flex-1 py-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] transition-colors">{t}</button>
                ))}
              </div>
              <div className="px-3 py-4 text-center text-[10px] text-zinc-600">
                <span>No social data loaded</span>
              </div>
            </div>
            {/* Quick Nav */}
            <div className="p-2 space-y-0.5 text-[10px]">
              {[
                { icon: <Wallet size={10}/>, label: 'Wallet Tracker' },
                { icon: <Activity size={10}/>, label: 'Holding' },
                { icon: <Zap size={10}/>, label: 'Watchlist' },
                { icon: <Flame size={10}/>, label: 'Trending' },
                { icon: <TrendingUp size={10}/>, label: 'Rank' },
                { icon: <DollarSign size={10}/>, label: 'PnL' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {/* SOL Price */}
            <div className="mt-auto p-3 border-t border-[#1a1a20]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">SOL</span>
                <span className="text-white font-bold">$75.22</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-zinc-600 mt-0.5">
                <span>Stable</span>
                <span>152ms · 15 FPS</span>
              </div>
            </div>
          </div>
        )}

        {/* === MAIN CONTENT: 3-Column Trenches === */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filter bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a1a20] bg-[#0a0a0b] text-[10px] shrink-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-500 hover:text-white mr-1">
              <ChevronRight size={14} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
            <div className="flex items-center gap-1 bg-[#111114] border border-[#1a1a20] rounded-md px-2 py-1">
              <Search size={10} className="text-zinc-600" />
              <input placeholder="Keyword1, Keyword1…(max5)" className="bg-transparent text-zinc-400 w-[150px] outline-none placeholder:text-zinc-700" />
            </div>
            <div className="flex items-center gap-1">
              {['P1','P2','P3'].map(p => (
                <button key={p} className="px-2 py-0.5 rounded border border-[#1a1a20] text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-colors">{p}</button>
              ))}
            </div>
            <span className="text-zinc-700 ml-auto text-[9px]">Auto-refresh 8s · {new Date(lastUpdate).toLocaleTimeString()}</span>
          </div>

          {/* 3 Columns */}
          <div className="flex flex-1 overflow-hidden">
            <TokenColumn 
              title="New" tokens={data.fresh} stage="new"
              icon={<Sparkles size={11} />} accent="text-cyan-400"
            />
            <TokenColumn 
              title="Almost Bonded" tokens={data.bonding} stage="bonding"
              icon={<Flame size={11} />} accent="text-orange-400"
            />
            <TokenColumn 
              title="Migrated" tokens={data.migrated} stage="migrated"
              icon={<Zap size={11} />} accent="text-green-400"
            />
          </div>

          {/* Bottom Status Bar */}
          <div className="h-7 border-t border-[#1a1a20] flex items-center px-3 gap-4 text-[9px] text-zinc-600 shrink-0 bg-[#0a0a0b]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span>Live</span></div>
              <span>|</span>
              <span>{allTokens.length} tokens</span>
              <span>|</span>
              <span>SOL $75.22</span>
            </div>
            <div className="ml-auto flex gap-3">
              <span>Wallet Tracker</span><span>Social Tracker</span><span>Holding</span><span>Watchlist</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
