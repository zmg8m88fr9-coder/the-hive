import { BRAINS, HIVE_STATS } from '../lib/hiveData';
import BrainCard from '../components/hive/BrainCard';

const VOID    = '#0B0905';
const SURFACE = '#131009';
const BORDER  = '#2B2216';
const TEXT    = '#DDD6C4';
const MUTED   = '#8A7F6D';
const DIM     = '#4D4538';
const GOLD    = '#C8892A';
const AMBER   = '#E8A620';
const PROFIT  = '#3E9E6B';
const LOSS    = '#C04438';

const RANK_COLORS = ['#D4A020', '#8A7F6D', '#8A5C28', DIM, DIM, DIM];

export default function BrainGrid() {
  const sortedBrains = [...BRAINS].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{ background: VOID, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="cinzel text-sm font-bold tracking-[0.14em]" style={{ color: GOLD }}>
          BRAIN GRID
        </div>
        <div className="text-[7px] tracking-widest mt-0.5" style={{ color: DIM }}>
          6 MARKET SPECIALISTS · NO COPY TRADING · CROSS-MARKET INTEL
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Leaderboard */}
        <div
          className="rounded-xl p-3"
          style={{
            background: SURFACE,
            border: `1px solid rgba(200,137,42,0.18)`,
            boxShadow: `inset 0 1px 0 rgba(200,137,42,0.05)`,
          }}
        >
          <div className="text-[8px] tracking-[0.2em] mb-3 font-bold" style={{ color: MUTED }}>RANKED BY P&L</div>
          <div className="space-y-2.5">
            {sortedBrains.map((b, i) => {
              const pnlPct = b.startingBalance > 0 ? ((b.balance - b.startingBalance) / b.startingBalance) * 100 : 0;
              const rankColor = RANK_COLORS[i] ?? DIM;
              return (
                <div key={b.id} className="flex items-center gap-2.5">
                  <span className="mono text-xs font-black w-5 text-center" style={{ color: rankColor }}>
                    #{i + 1}
                  </span>
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${b.color}14` }}
                  >
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black truncate" style={{ color: b.color }}>{b.name}</div>
                    <div className="text-[7px]" style={{ color: b.color + '88' }}>{b.focus}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-[10px] font-bold" style={{ color: b.totalPnl >= 0 ? PROFIT : LOSS }}>
                      {b.totalPnl >= 0 ? "+" : ""}${b.totalPnl.toFixed(0)}
                    </div>
                    <div className="mono text-[8px]" style={{ color: pnlPct >= 0 ? PROFIT : LOSS }}>
                      {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hive stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "TOTAL BALANCE", value: `$${HIVE_STATS.totalBalance.toFixed(0)}`, color: AMBER  },
            { label: "TOTAL P&L",     value: `+$${HIVE_STATS.totalPnl.toFixed(0)}`,    color: PROFIT },
            { label: "TOTAL TRADES",  value: HIVE_STATS.totalTrades,                   color: TEXT   },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[7px] tracking-widest mt-0.5" style={{ color: DIM }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Brain cards */}
        <div className="grid grid-cols-1 gap-3">
          {BRAINS.map(brain => (
            <BrainCard key={brain.id} brain={brain} />
          ))}
        </div>
      </div>
    </div>
  );
}
