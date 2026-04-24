import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import { format } from 'date-fns';

const BRAIN_FILTER = ["ALL", "THE_BRAIN", "APEX", "VENOM", "ORACLE", "GHOST", "TITAN"];
const STATUS_FILTER = ["ALL", "open", "closed", "cancelled"];

export default function TradeHistory() {
  const [brainFilter, setBrainFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 100),
  });

  const filtered = trades.filter(t => {
    const bMatch = brainFilter === "ALL" || t.brain_id === brainFilter;
    const sMatch = statusFilter === "ALL" || t.status === statusFilter;
    return bMatch && sMatch;
  });

  const openTrades = trades.filter(t => t.status === "open");
  const closedTrades = trades.filter(t => t.status === "closed");
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#FFB81C]">TRADE HISTORY</h1>
            <div className="text-[8px] text-[#6b6860]">{openTrades.length} open · {closedTrades.length} closed · ${totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)} realized P&L</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e]">LIVE</span>
          </div>
        </div>

        {/* Brain Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-2">
          {BRAIN_FILTER.map(id => {
            const brain = BRAINS.find(b => b.id === id);
            const color = brain?.color ?? "#FFB81C";
            const active = brainFilter === id;
            return (
              <button key={id} onClick={() => setBrainFilter(id)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: color + "25", border: `1px solid ${color}60`, color }
                  : { background: "transparent", border: "1px solid #222", color: "#6b6860" }}>
                {id === "ALL" ? "ALL" : id.replace("_", " ")}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {STATUS_FILTER.map(s => {
            const active = statusFilter === s;
            const color = s === "open" ? "#22c55e" : s === "closed" ? "#FFB81C" : s === "cancelled" ? "#ef4444" : "#d4d0c8";
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all capitalize"
                style={active
                  ? { background: color + "20", border: `1px solid ${color}50`, color }
                  : { background: "transparent", border: "1px solid #1a1a1a", color: "#444" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2">
        {isLoading && (
          <div className="text-center py-12 text-[#6b6860] text-[10px] tracking-widest">LOADING TRADES...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-2xl mb-2 opacity-20">◎</div>
            <div className="text-[10px] text-[#333] tracking-widest">NO TRADES FOUND</div>
            <div className="text-[8px] text-[#222] mt-1">Trades logged by the brains will appear here</div>
          </div>
        )}

        {filtered.map(trade => {
          const brain = BRAINS.find(b => b.id === trade.brain_id);
          const color = brain?.color ?? "#FFB81C";
          const isBuy = trade.action === "BUY";
          const isOpen = trade.status === "open";
          const pnlColor = (trade.pnl ?? 0) >= 0 ? "#22c55e" : "#ef4444";

          return (
            <div key={trade.id} className="bg-[#0d0d0d] border rounded-xl p-3"
              style={{ borderColor: isOpen ? color + "40" : "#1a1a1a" }}>
              <div className="flex items-start gap-2.5">
                {/* Brain icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: color + "15", border: `1px solid ${color}30` }}>
                  {brain?.icon ?? "◎"}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Row 1: ticker + action + status */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono font-black text-sm text-[#d4d0c8]">{trade.ticker}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isBuy ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#ef444420] text-[#ef4444]"}`}>
                      {isBuy ? "▲ BUY" : "▼ SHORT"}
                    </span>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ml-auto ${isOpen ? "bg-[#22c55e15] text-[#22c55e]" : trade.status === "cancelled" ? "bg-[#ef444415] text-[#ef4444]" : "bg-[#FFB81C15] text-[#FFB81C]"}`}>
                      {trade.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Row 2: prices */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[8px] text-[#5a5a54]">ENTRY <span className="text-[#9a9a94] font-mono">${trade.entry_price?.toFixed(4)}</span></span>
                    {trade.exit_price != null && (
                      <span className="text-[8px] text-[#5a5a54]">EXIT <span className="text-[#9a9a94] font-mono">${trade.exit_price?.toFixed(4)}</span></span>
                    )}
                    {trade.pnl != null && (
                      <span className="text-[8px] font-bold mono ml-auto" style={{ color: pnlColor }}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)} ({trade.pnl_pct >= 0 ? "+" : ""}{trade.pnl_pct?.toFixed(2)}%)
                      </span>
                    )}
                  </div>

                  {/* Row 3: brain + time */}
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: color + "15", color, border: `1px solid ${color}30` }}>
                      {brain?.name ?? trade.brain_id}
                    </span>
                    {trade.opened_at && (
                      <span className="text-[7px] text-[#3a3a3a]">
                        {format(new Date(trade.opened_at), 'MMM d, HH:mm')}
                      </span>
                    )}
                    {trade.reasoning && (
                      <span className="text-[7px] text-[#3a3a3a] truncate flex-1">{trade.reasoning}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}