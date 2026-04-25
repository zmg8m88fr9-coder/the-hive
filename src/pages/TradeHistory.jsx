import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import { calculateTotalUnrealizedPnL } from '../lib/realtimePnL';
import TradeCard from '../components/hive/TradeCard';
import TradeTable from '../components/hive/TradeTable';

const BRAIN_FILTER = ["ALL", "THE_BRAIN", "APEX", "VENOM", "ORACLE", "GHOST", "TITAN"];
const STATUS_FILTER = ["ALL", "open", "closed", "cancelled"];

export default function TradeHistory() {
  const [brainFilter, setBrainFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("closed");
  const [viewMode, setViewMode] = useState("table"); // table | cards
  const [unrealizedPnL, setUnrealizedPnL] = useState(0);

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

  // Real-time unrealized P&L update
  useEffect(() => {
    const interval = setInterval(() => {
      if (openTrades.length > 0) {
        setUnrealizedPnL(calculateTotalUnrealizedPnL(openTrades));
      }
    }, 500); // Update every 500ms
    
    return () => clearInterval(interval);
  }, [openTrades]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#C8892A]">TRADE HISTORY</h1>
            <div className="text-[8px] text-[#8A7F6D]">{openTrades.length} open · {closedTrades.length} closed · ${totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)} realized · ${unrealizedPnL >= 0 ? "+" : ""}{unrealizedPnL.toFixed(2)} unrealized</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E9E6B] animate-pulse" />
            <span className="text-[8px] text-[#3E9E6B]">LIVE</span>
          </div>
        </div>

        {/* Brain Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-2">
          {BRAIN_FILTER.map(id => {
            const brain = BRAINS.find(b => b.id === id);
            const color = brain?.color ?? "#C8892A";
            const active = brainFilter === id;
            return (
              <button key={id} onClick={() => setBrainFilter(id)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: color + "25", border: `1px solid ${color}60`, color }
                  : { background: "transparent", border: "1px solid #222", color: "#8A7F6D" }}>
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
                ? { background: '#C8892A20', border: '1px solid #C8892A50', color: '#C8892A' }
                : { background: 'transparent', border: '1px solid #2B2216', color: '#444' }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5">
          {STATUS_FILTER.map(s => {
            const active = statusFilter === s;
            const color = s === "open" ? "#3E9E6B" : s === "closed" ? "#C8892A" : s === "cancelled" ? "#C04438" : "#DDD6C4";
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all capitalize"
                style={active
                  ? { background: color + "20", border: `1px solid ${color}50`, color }
                  : { background: "transparent", border: "1px solid #2B2216", color: "#444" }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 pb-6">
        {isLoading && (
          <div className="text-center py-12 text-[#8A7F6D] text-[10px] tracking-widest">LOADING TRADES...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-2xl mb-2 opacity-20">◎</div>
            <div className="text-[10px] text-[#333] tracking-widest">NO TRADES FOUND</div>
            <div className="text-[8px] text-[#222] mt-1">Trades logged by the brains will appear here</div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && viewMode === 'table' && (
          <div className="bg-[#131009] border border-[#2B2216] rounded-xl overflow-hidden mx-4">
            {/* Summary row */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#2B2216] bg-[#090909]">
              <span className="text-[7px] text-[#4D4538] tracking-widest">{filtered.length} TRADES</span>
              <span className="text-[7px] text-[#4D4538]">·</span>
              <span className="text-[7px] font-bold" style={{ color: totalPnl >= 0 ? '#3E9E6B' : '#C04438' }}>
                REALIZED P&L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
              <span className="text-[7px] text-[#4D4538]">·</span>
              {openTrades.length > 0 && (
                <>
                  <span className="text-[7px] font-bold" style={{ color: unrealizedPnL >= 0 ? '#3E9E6B' : '#C04438' }}>
                    UNREALIZED: {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                  </span>
                  <span className="text-[7px] text-[#4D4538]">·</span>
                </>
              )}
              <span className="text-[7px] text-[#4D4538]">{openTrades.length} OPEN · {closedTrades.length} CLOSED</span>
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