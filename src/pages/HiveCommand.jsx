import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAINS, HIVE_STATS, generateSignals, generateSpark } from '../lib/hiveData';
import SparkLine from '../components/hive/SparkLine';
import BrainCard from '../components/hive/BrainCard';
import PortfolioExposure from '../components/hive/PortfolioExposure';
import StockHunter from '../components/hive/StockHunter';
import AlphaWidget from '../components/hive/AlphaWidget';

/* THE HIVE — Neural Market Intelligence
   Design: Dark Apiary Intelligence v2
   Warm obsidian · Honey gold · Earthy minerals */

const VOID        = '#0B0905';
const SURFACE     = '#131009';
const ELEVATED    = '#1A1510';
const BORDER      = '#2B2216';
const BORDER_MED  = '#3A2E1F';
const TEXT        = '#DDD6C4';
const MUTED       = '#8A7F6D';
const DIM         = '#4D4538';
const GOLD        = '#C8892A';
const AMBER       = '#E8A620';
const PROFIT      = '#3E9E6B';
const LOSS        = '#C04438';

// Hexagonal logo mark — the Hive sigil
function HiveSigil({ size = 26 }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 26 30" fill="none">
      <path d="M13 1.5L24.5 7.75V20.25L13 26.5L1.5 20.25V7.75Z"
        fill={GOLD + '18'} stroke={GOLD} strokeWidth="1.2" />
      <text x="13" y="19" textAnchor="middle"
        fill={AMBER} fontSize="11" fontFamily="Cinzel, serif" fontWeight="700">H</text>
    </svg>
  );
}

export default function HiveCommand() {
  const [signals, setSignals] = useState(() => generateSignals());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      if (Math.random() > 0.7) setSignals(generateSignals());
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const pnlPct = (HIVE_STATS.totalPnl / (BRAINS.length * 500)) * 100;
  const latestSignals = signals.slice(0, 4);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{
          background: `linear-gradient(to bottom, ${VOID} 80%, ${VOID}ee)`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HiveSigil size={26} />
            <div>
              <div className="cinzel text-sm font-bold tracking-[0.14em]" style={{ color: GOLD }}>
                THE HIVE
              </div>
              <div className="text-[7px] tracking-widest" style={{ color: DIM }}>
                6 MARKETS · NEURAL WEB · $3K→$600K
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: PROFIT, display: 'inline-block' }} />
            <span className="text-[8px] font-bold tracking-widest" style={{ color: PROFIT }}>LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* ── Hive Balance ──────────────────────────────── */}
        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${SURFACE} 0%, #161208 100%)`,
            border: `1px solid rgba(200,137,42,0.22)`,
            boxShadow: `0 2px 24px rgba(200,137,42,0.05), inset 0 1px 0 rgba(200,137,42,0.06)`,
          }}
        >
          <div className="text-[7px] tracking-[0.2em] mb-1" style={{ color: DIM }}>HIVE BALANCE</div>
          <div className="mono text-2xl font-black mb-0.5" style={{ color: AMBER }}>
            ${HIVE_STATS.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`mono text-xs font-bold`} style={{ color: HIVE_STATS.totalPnl >= 0 ? PROFIT : LOSS }}>
            {HIVE_STATS.totalPnl >= 0 ? "+" : ""}${HIVE_STATS.totalPnl.toFixed(2)}&nbsp;
            <span className="text-[9px]">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
          </div>
          <div className="text-[7px] mt-0.5" style={{ color: DIM }}>
            {HIVE_STATS.totalTrades} total trades · 6 specialists active
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
            {[
              { label: "BALANCE",  value: `$${HIVE_STATS.totalBalance.toFixed(0)}`,  color: GOLD   },
              { label: "TOTAL P&L", value: `+$${HIVE_STATS.totalPnl.toFixed(0)}`,   color: PROFIT },
              { label: "TRADES",   value: HIVE_STATS.totalTrades,                    color: TEXT   },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[7px] tracking-widest" style={{ color: DIM }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Portfolio Exposure ────────────────────────── */}
        <PortfolioExposure />

        {/* ── Stock Hunter ─────────────────────────────── */}
        <StockHunter />

        {/* ── Alpha Widget ─────────────────────────────── */}
        <AlphaWidget />

        {/* ── Live Signals ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[8px] font-bold tracking-[0.2em]" style={{ color: MUTED }}>LIVE SIGNALS</div>
            <Link to="/signals">
              <span className="text-[8px] font-bold tracking-widest" style={{ color: GOLD }}>VIEW ALL →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {latestSignals.map(sig => {
              const brain = BRAINS.find(b => b.id === sig.brainId);
              const color = brain?.color ?? GOLD;
              const isBuy = sig.action === "BUY";
              return (
                <div
                  key={sig.id}
                  className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${color}22`,
                    borderLeft: `2px solid ${color}55`,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    {brain?.icon ?? "◎"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="mono font-black text-xs" style={{ color: TEXT }}>{sig.ticker}</span>
                      <span
                        className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                        style={isBuy
                          ? { background: `${PROFIT}18`, color: PROFIT, border: `1px solid ${PROFIT}28` }
                          : { background: `${LOSS}18`,   color: LOSS,   border: `1px solid ${LOSS}28`   }}
                      >
                        {isBuy ? "▲ BUY" : "▼ SHORT"}
                      </span>
                    </div>
                    <div className="text-[7px] truncate" style={{ color: MUTED }}>
                      {sig.reasoning.slice(0, 55)}…
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="mono text-[9px] font-bold" style={{ color }}>
                      {(sig.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-[7px]" style={{ color: DIM }}>{brain?.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6 Specialists ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[8px] font-bold tracking-[0.2em]" style={{ color: MUTED }}>6 SPECIALISTS</div>
            <Link to="/brains">
              <span className="text-[8px] font-bold tracking-widest" style={{ color: GOLD }}>FULL GRID →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {BRAINS.map(brain => (
              <BrainCard key={brain.id} brain={brain} compact />
            ))}
          </div>
        </div>

        {/* ── Brotherhood of Sins ───────────────────────── */}
        <div>
          <div className="text-[8px] font-bold tracking-[0.2em] mb-2.5" style={{ color: MUTED }}>
            BROTHERHOOD OF SINS
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BRAINS.map(b => (
              <Link key={b.id} to={`/brains/${b.id}`}>
                <div
                  className="rounded-xl p-3 text-center active:scale-95 transition-all duration-150"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${b.color}28`,
                    boxShadow: `inset 0 1px 0 ${b.color}08`,
                  }}
                >
                  {/* Hexagonal glyph container */}
                  <div
                    className="w-8 h-8 mx-auto mb-1.5 flex items-center justify-center"
                    style={{
                      background: `${b.color}12`,
                      border: `1px solid ${b.color}28`,
                      borderRadius: '6px',
                    }}
                  >
                    <span className="text-base leading-none" style={{ color: b.color }}>{b.sinGlyph}</span>
                  </div>
                  <div className="text-[7px] font-bold tracking-[0.15em]" style={{ color: b.color }}>{b.sin}</div>
                  <div className="text-[6px] mt-0.5" style={{ color: DIM }}>{b.focus}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
