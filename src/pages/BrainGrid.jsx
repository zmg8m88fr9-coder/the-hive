import { BRAINS } from '../lib/hiveData';
import BrainCard from '../components/hive/BrainCard';
import HiveHeader from '../components/hive/HiveHeader';

const RANK_COLORS = ['#FFB81C', '#9ca3af', '#cd7f32'];

export default function BrainGrid() {
  const sortedBrains = [...BRAINS].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="flex flex-col min-h-full">
      <HiveHeader
        title="BRAIN GRID"
        subtitle="6 Market Specialists · No Copy Trading · Cross-Market Intel"
        live
      />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Leaderboard */}
        <div
          className="rounded-xl p-3"
          style={{
            background: 'var(--hive-surface-1)',
            border: '1px solid var(--hive-gold-ghost)',
          }}
        >
          <div className="hive-label mb-3" style={{ color: 'var(--hive-text-3)' }}>RANKED BY P&L</div>
          <div className="space-y-2.5">
            {sortedBrains.map((b, i) => {
              const pnlPct = b.startingBalance > 0
                ? ((b.balance - b.startingBalance) / b.startingBalance) * 100
                : 0;
              const rankColor = RANK_COLORS[i] ?? 'var(--hive-text-3)';
              const profitColor = b.totalPnl >= 0 ? 'var(--hive-green)' : 'var(--hive-red)';

              return (
                <div key={b.id} className="flex items-center gap-2.5">
                  <span className="mono text-xs font-black w-5 text-center" style={{ color: rankColor }}>
                    #{i + 1}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: b.color + '12', border: `1px solid ${b.color}25` }}
                  >
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black truncate" style={{ color: b.color }}>{b.name}</div>
                    <div className="text-[7px] mt-0.5" style={{ color: b.color + 'aa' }}>{b.focus}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-[10px] font-bold" style={{ color: profitColor }}>
                      {b.totalPnl >= 0 ? '+' : ''}${b.totalPnl.toFixed(0)}
                    </div>
                    <div className="mono text-[8px]" style={{ color: profitColor + 'aa' }}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
