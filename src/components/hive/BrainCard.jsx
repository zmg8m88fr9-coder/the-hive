import { Link } from 'react-router-dom';
import SparkLine from './SparkLine';
import { generateSpark } from '../../lib/hiveData';
import { useMemo } from 'react';

function CompactCard({ brain }) {
  const { color, icon, name, focus, balance, startingBalance } = brain;
  const pnlPct = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const seed = brain.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const spark = useMemo(() => generateSpark(20, pnlPct > 0 ? 1 : -1, seed), [brain.id]);

  return (
    <Link to={`/brains/${brain.id}`}>
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98]"
        style={{ borderColor: color + '28', background: 'var(--hive-surface-1)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: color + '12', border: `1px solid ${color}25` }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black tracking-widest truncate" style={{ color }}>{name}</div>
          <div className="text-[7px] mt-0.5" style={{ color: color + '88' }}>{focus}</div>
        </div>

        <div className="w-14 flex-shrink-0">
          <SparkLine
            data={spark} width={56} height={18}
            color={pnlPct >= 0 ? 'var(--hive-green)' : 'var(--hive-red)'}
            showDot={false}
          />
        </div>

        <div className="text-right flex-shrink-0">
          <div className="mono text-[10px] font-black" style={{ color }}>${balance.toFixed(0)}</div>
          <div
            className="mono text-[8px] font-bold"
            style={{ color: pnlPct >= 0 ? 'var(--hive-green)' : 'var(--hive-red)' }}
          >
            {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
          </div>
        </div>
      </div>
    </Link>
  );
}

function FullCard({ brain }) {
  const {
    color, icon, name, focus, sin, sinGlyph,
    balance, startingBalance, totalPnl, totalTrades, wonTrades, riskTolerance, rlMethod,
  } = brain;

  const pnlPct = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(0) : '0';
  const seed = brain.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const spark = useMemo(() => generateSpark(24, pnlPct > 0 ? 1 : -1, seed), [brain.id]);
  const profitColor = pnlPct >= 0 ? 'var(--hive-green)' : 'var(--hive-red)';

  return (
    <Link to={`/brains/${brain.id}`}>
      <div
        className="relative overflow-hidden rounded-xl border transition-all active:scale-[0.98]"
        style={{
          borderColor: color + '35',
          background: 'var(--hive-surface-1)',
          boxShadow: `0 0 0 1px ${color}08, inset 0 1px 0 ${color}06`,
        }}
      >
        {/* Sin glyph watermark */}
        {sinGlyph && (
          <div className="sin-watermark" style={{ color }}>{sinGlyph}</div>
        )}

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: color + '12', border: `1px solid ${color}28` }}
              >
                {icon}
              </div>
              <div>
                <div className="text-xs font-black tracking-widest" style={{ color }}>{name}</div>
                <div className="text-[7px] mt-0.5" style={{ color: color + '99' }}>
                  {sin} · {focus}
                </div>
                {rlMethod && (
                  <div
                    className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[6px] font-bold tracking-widest"
                    style={{ background: color + '12', color: color + 'bb', border: `1px solid ${color}20` }}
                  >
                    {rlMethod}
                  </div>
                )}
              </div>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
          </div>

          {/* Balance */}
          <div className="mb-1">
            <div className="mono text-xl font-black leading-tight" style={{ color }}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mono text-[10px] font-bold" style={{ color: profitColor }}>
              {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
              <span className="ml-2" style={{ color: profitColor + 'aa' }}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Spark */}
          <div className="w-full mt-3 mb-3">
            <SparkLine data={spark} width="100%" height={32} color={profitColor} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'TRADES', value: totalTrades, color: 'var(--hive-text-1)' },
              { label: 'WIN %',  value: `${winRate}%`, color: Number(winRate) >= 50 ? 'var(--hive-green)' : 'var(--hive-red)' },
              { label: 'RISK',   value: `${(riskTolerance * 100).toFixed(0)}%`, color },
            ].map(s => (
              <div key={s.label} className="hive-stat-cell">
                <div className="hive-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="hive-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BrainCard({ brain, compact = false }) {
  if (compact) return <CompactCard brain={brain} />;
  return <FullCard brain={brain} />;
}
