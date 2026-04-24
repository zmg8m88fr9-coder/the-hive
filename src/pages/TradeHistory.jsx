import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import TradeCard from '../components/hive/TradeCard';
import TradeTable from '../components/hive/TradeTable';

const BRAIN_FILTER = ["ALL", "THE_BRAIN", "APEX", "VENOM", "ORACLE", "GHOST", "TITAN"];
const STATUS_FILTER = ["ALL", "open", "closed", "cancelled"];

export default function TradeHistory() {
  const [brainFilter, setBrainFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("closed");
  const [viewMode, setViewMode] = useState("table"); // table | cards

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

        {/* View Mode Toggle */}
        <div className="flex gap-1.5 mb-2">
          {[{ id: 'table', label: '⊟ TABLE' }, { id: 'cards', label: '⊞ CARDS' }].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className="px-3 py-1 rounded text-[8px] font-bold tracking-widest transition-all"
              style={viewMode === v.id
                ? { background: '#FFB81C20', border: '1px solid #FFB81C50', color: '#FFB81C' }
                : { background: 'transparent', border: '1px solid #1a1a1a', color: '#444' }}>
              {v.label}
            </button>
          ))}
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

      <div className="pt-3 pb-6">
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

        {!isLoading && filtered.length > 0 && viewMode === 'table' && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden mx-4">
            {/* Summary row */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#1a1a1a] bg-[#090909]">
              <span className="text-[7px] text-[#3a3a3a] tracking-widest">{filtered.length} TRADES</span>
              <span className="text-[7px] text-[#3a3a3a]">·</span>
              <span className="text-[7px] font-bold" style={{ color: totalPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                REALIZED P&L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
              <span className="text-[7px] text-[#3a3a3a]">·</span>
              <span className="text-[7px] text-[#4a4a44]">{openTrades.length} OPEN · {closedTrades.length} CLOSED</span>
            </div>
            <TradeTable trades={filtered} />
          </div>
        )}

        {!isLoading && filtered.length > 0 && viewMode === 'cards' && (
          <div className="px-4 space-y-2">
            {filtered.map(trade => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}