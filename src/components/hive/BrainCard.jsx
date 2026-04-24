import { Link } from 'react-router-dom';
import SparkLine from './SparkLine';
import { generateSpark } from '../../lib/hiveData';
import { useMemo } from 'react';

export default function BrainCard({ brain, compact = false }) {
  const { color, icon, name, focus, sin, balance, startingBalance, totalPnl, totalTrades, wonTrades } = brain;
  const pnlPct = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(0) : "0";
  const spark = useMemo(() => generateSpark(20, pnlPct > 0 ? 1 : -1), [brain.id]);

  if (compact) {
    return (
      <Link to={`/brains/${brain.id}`}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all active:scale-95"
          style={{ borderColor: color + "30", background: "#0d0d0d" }}>
          <span className="text-lg">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black tracking-widest truncate" style={{ color }}>{name}</div>
            <div className="text-[8px] text-[#6b6860]">{focus}</div>
          </div>
          <div className="w-16">
            <SparkLine data={spark} width={64} height={18} color={pnlPct >= 0 ? "#22c55e" : "#ef4444"} showDot={false} />
          </div>
          <div className="text-right">
            <div className="mono text-[10px] font-black" style={{ color }}>${balance.toFixed(0)}</div>
            <div className={`mono text-[8px] font-bold ${pnlPct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/brains/${brain.id}`}>
      <div className="bg-[#0d0d0d] border rounded-xl p-4 active:scale-98 transition-all"
        style={{ borderColor: color + "40" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: color + "15", border: `1px solid ${color}30` }}>
              {icon}
            </div>
            <div>
              <div className="text-xs font-black tracking-widest" style={{ color }}>{name}</div>
              <div className="text-[8px] text-[#6b6860]">{sin} · {focus}</div>
            </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse mt-1" style={{ background: color }} />
        </div>

        {/* Balance */}
        <div className="mb-2">
          <div className="mono text-lg font-black" style={{ color }}>${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`mono text-[10px] font-bold ${pnlPct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}% · {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
        </div>

        {/* Spark */}
        <div className="w-full mb-3">
          <SparkLine data={spark} width="100%" height={32} color={pnlPct >= 0 ? "#22c55e" : "#ef4444"} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-[#111] rounded p-1.5 text-center">
            <div className="mono text-[11px] font-bold text-[#d4d0c8]">{totalTrades}</div>
            <div className="text-[7px] text-[#6b6860]">TRADES</div>
          </div>
          <div className="bg-[#111] rounded p-1.5 text-center">
            <div className="mono text-[11px] font-bold" style={{ color: Number(winRate) >= 50 ? "#22c55e" : "#ef4444" }}>
              {winRate}%
            </div>
            <div className="text-[7px] text-[#6b6860]">WIN</div>
          </div>
          <div className="bg-[#111] rounded p-1.5 text-center">
            <div className="mono text-[11px] font-bold" style={{ color }}>
              {(brain.riskTolerance * 100).toFixed(0)}%
            </div>
            <div className="text-[7px] text-[#6b6860]">RISK</div>
          </div>
        </div>
      </div>
    </Link>
  );
}