import { Link } from 'react-router-dom';
import SparkLine from './SparkLine';
import { generateSpark } from '../../lib/hiveData';
import { useMemo } from 'react';

const SURFACE  = '#131009';
const ELEVATED = '#1A1510';
const BORDER   = '#2B2216';
const TEXT     = '#DDD6C4';
const MUTED    = '#8A7F6D';
const DIM      = '#4D4538';
const PROFIT   = '#3E9E6B';
const LOSS     = '#C04438';

export default function BrainCard({ brain, compact = false }) {
  const { color, icon, name, focus, sin, balance, startingBalance, totalPnl, totalTrades, wonTrades } = brain;
  const pnlPct  = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(0) : "0";
  const seed    = brain.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const spark   = useMemo(() => generateSpark(20, pnlPct > 0 ? 1 : -1, seed), [brain.id]);
  const pnlColor = pnlPct >= 0 ? PROFIT : LOSS;

  /* ── Compact row variant ── used on HiveCommand */
  if (compact) {
    return (
      <Link to={`/brains/${brain.id}`}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] duration-150"
          style={{
            background: SURFACE,
            border: `1px solid ${color}22`,
            borderLeft: `2px solid ${color}44`,
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: `${color}14`, border: `1px solid ${color}28` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black tracking-widest truncate" style={{ color }}>{name}</div>
            <div className="text-[7px]" style={{ color: DIM }}>{focus}</div>
          </div>
          <div className="w-14 flex-shrink-0">
            <SparkLine data={spark} width={56} height={16} color={pnlColor} showDot={false} />
          </div>
          <div className="text-right flex-shrink-0">
            <div className="mono text-[10px] font-black" style={{ color }}>${balance.toFixed(0)}</div>
            <div className="mono text-[8px] font-bold" style={{ color: pnlColor }}>
              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Full card variant ── used on BrainGrid */
  return (
    <Link to={`/brains/${brain.id}`}>
      <div
        className="rounded-xl p-4 active:scale-[0.98] transition-all duration-150"
        style={{
          background: `linear-gradient(145deg, ${SURFACE} 0%, #161208 100%)`,
          border: `1px solid ${color}35`,
          boxShadow: `0 2px 20px ${color}08, inset 0 1px 0 ${color}08`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: `${color}14`, border: `1px solid ${color}28` }}
            >
              {icon}
            </div>
            <div>
              <div className="text-xs font-black tracking-widest" style={{ color }}>{name}</div>
              <div className="text-[8px] mt-0.5" style={{ color: MUTED }}>{sin} · {focus}</div>
              {brain.rlMethod && (
                <div
                  className="text-[6px] font-bold mt-1 px-1.5 py-0.5 rounded inline-block tracking-widest"
                  style={{
                    background: `${color}12`,
                    color: color + 'bb',
                    border: `1px solid ${color}22`,
                  }}
                >
                  {brain.rlMethod}
                </div>
              )}
            </div>
          </div>
          {/* Live pulse dot */}
          <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 5px ${color}80` }} />
        </div>

        {/* Balance */}
        <div className="mb-2.5">
          <div className="mono text-lg font-black" style={{ color }}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mono text-[10px] font-bold mt-0.5" style={{ color: pnlColor }}>
            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%&nbsp;&nbsp;
            <span style={{ color: MUTED }}>|</span>&nbsp;&nbsp;
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-full mb-3">
          <SparkLine data={spark} width="100%" height={30} color={pnlColor} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="stat-cell">
            <div className="mono text-[11px] font-bold" style={{ color: TEXT }}>{totalTrades}</div>
            <div className="text-[7px] tracking-widest" style={{ color: DIM }}>TRADES</div>
          </div>
          <div className="stat-cell">
            <div className="mono text-[11px] font-bold" style={{ color: Number(winRate) >= 50 ? PROFIT : LOSS }}>
              {winRate}%
            </div>
            <div className="text-[7px] tracking-widest" style={{ color: DIM }}>WIN</div>
          </div>
          <div className="stat-cell">
            <div className="mono text-[11px] font-bold" style={{ color }}>
              {(brain.riskTolerance * 100).toFixed(0)}%
            </div>
            <div className="text-[7px] tracking-widest" style={{ color: DIM }}>RISK</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
