import { BRAINS, HIVE_STATS } from '../lib/hiveData';
import BrainCard from '../components/hive/BrainCard';

export default function BrainGrid() {
  const sortedBrains = [...BRAINS].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-12 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#FFB81C]">BRAIN GRID</h1>
        <div className="text-[8px] text-[#6b6860]">6 Market Specialists · No Copy Trading · Cross-Market Intel</div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Leaderboard */}
        <div className="bg-[#0d0d0d] border border-[#FFB81C20] rounded-xl p-3">
          <div className="text-[9px] text-[#6b6860] tracking-widest mb-3">RANKED BY P&L</div>
          <div className="space-y-2">
            {sortedBrains.map((b, i) => {
              const pnlPct = b.startingBalance > 0 ? ((b.balance - b.startingBalance) / b.startingBalance) * 100 : 0;
              const rankColor = i === 0 ? "#FFB81C" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "#6b6860";
              return (
                <div key={b.id} className="flex items-center gap-2.5">
                  <span className="mono text-xs font-black w-5 text-center" style={{ color: rankColor }}>#{i+1}</span>
                  <span className="text-sm">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black truncate" style={{ color: b.color }}>{b.name}</div>
                    <div className="text-[7px]" style={{ color: b.color + "aa" }}>{b.focus}</div>
                  </div>
                  <div className="text-right">
                    <div className={`mono text-[10px] font-bold ${b.totalPnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {b.totalPnl >= 0 ? "+" : ""}${b.totalPnl.toFixed(0)}
                    </div>
                    <div className={`mono text-[8px] ${pnlPct >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brain Cards */}
        <div className="grid grid-cols-1 gap-3">
          {BRAINS.map(brain => (
            <BrainCard key={brain.id} brain={brain} />
          ))}
        </div>
      </div>
    </div>
  );
}