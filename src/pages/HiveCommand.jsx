import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAINS, HIVE_STATS, generateSignals } from '../lib/hiveData';
import BrainCard from '../components/hive/BrainCard';
import PortfolioExposure from '../components/hive/PortfolioExposure';
import StockHunter from '../components/hive/StockHunter';
import AlphaWidget from '../components/hive/AlphaWidget';

/* Section heading row */
function SectionHead({ label, linkTo, linkLabel = 'VIEW ALL →' }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="hive-section-title">{label}</span>
      {linkTo && (
        <Link to={linkTo}>
          <span className="text-[8px] font-bold tracking-widest" style={{ color: 'var(--hive-gold)' }}>
            {linkLabel}
          </span>
        </Link>
      )}
    </div>
  );
}

export default function HiveCommand() {
  const [signals, setSignals] = useState(() => generateSignals());

  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.random() > 0.7) setSignals(generateSignals());
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const pnlPct = BRAINS.length * 500 > 0
    ? (HIVE_STATS.totalPnl / (BRAINS.length * 500)) * 100
    : 0;
  const latestSignals = signals.slice(0, 4);

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{ background: 'var(--hive-base)', borderBottom: '1px solid var(--hive-border-1)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            {/* Brand mark */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-black flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #FFB81C 0%, #ef4444 35%, #a855f7 55%, #22c55e 70%, #3b82f6 85%, #f59e0b 100%)',
                  boxShadow: '0 0 10px rgba(255,184,28,0.3)',
                }}
              >
                H
              </div>
              <div>
                <div
                  className="text-sm font-black tracking-widest leading-none"
                  style={{ color: 'var(--hive-gold)' }}
                >
                  THE HIVE
                </div>
                <div className="hive-sublabel mt-0.5" style={{ color: 'var(--hive-text-3)' }}>
                  6 MARKETS · NEURAL WEB
                </div>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="hive-live">
            <div className="hive-live-dot" />
            <span className="hive-live-text">LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-5">

        {/* ── Hive Balance card ── */}
        <div
          className="rounded-xl p-4 relative overflow-hidden"
          style={{
            background: 'var(--hive-surface-1)',
            border: '1px solid var(--hive-gold-ghost)',
            boxShadow: '0 0 0 1px var(--hive-gold-ghost), inset 0 1px 0 rgba(255,184,28,0.04)',
          }}
        >
          {/* Subtle watermark */}
          <div
            className="absolute bottom-2 right-3 text-[80px] leading-none pointer-events-none select-none"
            style={{ color: 'var(--hive-gold)', opacity: 0.03 }}
          >
            ⬡
          </div>

          <div className="relative">
            <div className="hive-label mb-1" style={{ color: 'var(--hive-text-3)' }}>HIVE BALANCE</div>
            <div
              className="mono text-3xl font-black leading-tight"
              style={{ color: 'var(--hive-gold)' }}
            >
              ${HIVE_STATS.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className="mono text-xs font-bold mt-0.5"
              style={{ color: HIVE_STATS.totalPnl >= 0 ? 'var(--hive-green)' : 'var(--hive-red)' }}
            >
              {HIVE_STATS.totalPnl >= 0 ? '+' : ''}${HIVE_STATS.totalPnl.toFixed(2)}
              <span className="ml-1.5 opacity-70">
                ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
              </span>
            </div>
            <div className="hive-sublabel mt-1" style={{ color: 'var(--hive-text-3)' }}>
              {HIVE_STATS.totalTrades} total trades · 6 specialists active
            </div>

            {/* Mini stats */}
            <div
              className="grid grid-cols-3 gap-2 mt-3 pt-3"
              style={{ borderTop: '1px solid var(--hive-border-1)' }}
            >
              {[
                { label: 'BALANCE', value: `$${HIVE_STATS.totalBalance.toFixed(0)}`, color: 'var(--hive-gold)' },
                { label: 'TOTAL P&L', value: `+$${HIVE_STATS.totalPnl.toFixed(0)}`, color: 'var(--hive-green)' },
                { label: 'TRADES', value: HIVE_STATS.totalTrades, color: 'var(--hive-text-1)' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="hive-sublabel">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Portfolio Exposure ── */}
        <PortfolioExposure />

        {/* ── Stock Hunter ── */}
        <StockHunter />

        {/* ── Alpha Widget ── */}
        <AlphaWidget />

        {/* ── Live Signals ── */}
        <div>
          <SectionHead label="LIVE SIGNALS" linkTo="/signals" />
          <div className="space-y-2">
            {latestSignals.map(sig => {
              const brain = BRAINS.find(b => b.id === sig.brainId);
              const color = brain?.color ?? 'var(--hive-gold)';
              const isBuy = sig.action === 'BUY';
              return (
                <div
                  key={sig.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: color + '25', background: 'var(--hive-surface-1)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: color + '12', border: `1px solid ${color}25` }}
                  >
                    {brain?.icon ?? '◎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="mono font-black text-xs" style={{ color: 'var(--hive-text-0)' }}>
                        {sig.ticker}
                      </span>
                      <span className={`hive-badge ${isBuy ? 'hive-badge-buy' : 'hive-badge-sell'}`}>
                        {isBuy ? '▲ BUY' : '▼ SHORT'}
                      </span>
                    </div>
                    <div
                      className="text-[8px] truncate mt-0.5 line-clamp-1"
                      style={{ color: 'var(--hive-text-3)' }}
                    >
                      {sig.reasoning.slice(0, 60)}…
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="mono text-[9px] font-bold" style={{ color }}>
                      {(sig.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="hive-sublabel">{brain?.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6 Specialists ── */}
        <div>
          <SectionHead label="6 SPECIALISTS" linkTo="/brains" linkLabel="FULL GRID →" />
          <div className="space-y-2">
            {BRAINS.map(brain => (
              <BrainCard key={brain.id} brain={brain} compact />
            ))}
          </div>
        </div>

        {/* ── Brotherhood of Sins ── */}
        <div>
          <SectionHead label="BROTHERHOOD OF SINS" />
          <div className="grid grid-cols-3 gap-2">
            {BRAINS.map(b => (
              <Link key={b.id} to={`/brains/${b.id}`}>
                <div
                  className="relative overflow-hidden rounded-xl p-3 text-center transition-all active:scale-95"
                  style={{
                    background: 'var(--hive-surface-1)',
                    border: `1px solid ${b.color}28`,
                    boxShadow: `inset 0 1px 0 ${b.color}06`,
                  }}
                >
                  {/* Glyph watermark */}
                  <div
                    className="absolute bottom-0 right-1 text-4xl leading-none pointer-events-none select-none"
                    style={{ color: b.color, opacity: 0.06 }}
                  >
                    {b.sinGlyph}
                  </div>
                  <div className="relative">
                    <div className="text-2xl mb-1" style={{ color: b.color }}>{b.sinGlyph}</div>
                    <div
                      className="text-[8px] font-black tracking-widest"
                      style={{ color: b.color }}
                    >
                      {b.sin}
                    </div>
                    <div className="hive-sublabel mt-0.5">{b.focus}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
