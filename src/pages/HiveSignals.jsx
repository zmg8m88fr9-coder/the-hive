import { useState, useEffect } from 'react';
import { BRAINS, generateSignals } from '../lib/hiveData';

const VOID    = '#0B0905';
const SURFACE = '#131009';
const BORDER  = '#2B2216';
const TEXT    = '#DDD6C4';
const MUTED   = '#8A7F6D';
const DIM     = '#4D4538';
const GOLD    = '#C8892A';
const PROFIT  = '#3E9E6B';
const LOSS    = '#C04438';

const BRAIN_FILTER = ["ALL", "THE_BRAIN", "APEX", "VENOM", "ORACLE", "GHOST", "TITAN"];

export default function HiveSignals() {
  const [signals, setSignals] = useState(() => generateSignals());
  const [filter, setFilter]   = useState("ALL");

  useEffect(() => {
    const iv = setInterval(() => {
      setSignals(prev => {
        const newSig = generateSignals();
        return [...newSig, ...prev].slice(0, 30);
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const filtered = filter === "ALL" ? signals : signals.filter(s => s.brainId === filter);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{ background: VOID, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="cinzel text-sm font-bold tracking-[0.14em]" style={{ color: GOLD }}>
              SIGNAL FEED
            </div>
            <div className="text-[7px] tracking-widest mt-0.5" style={{ color: DIM }}>
              REAL-TIME TRADING SIGNALS · ALL 6 BRAINS
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: PROFIT, display: 'inline-block' }} />
            <span className="text-[8px] font-bold tracking-widest" style={{ color: PROFIT }}>LIVE</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {BRAIN_FILTER.map(id => {
            const brain  = BRAINS.find(b => b.id === id);
            const color  = brain?.color ?? GOLD;
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all duration-150"
                style={active
                  ? { background: `${color}20`, border: `1px solid ${color}50`, color }
                  : { background: 'transparent', border: `1px solid ${BORDER}`, color: DIM }}
              >
                {id === "ALL" ? "ALL" : id.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2">
        {filtered.map((sig, i) => {
          const brain  = BRAINS.find(b => b.id === sig.brainId);
          const color  = brain?.color ?? GOLD;
          const isBuy  = sig.action === "BUY";
          const timeAgo = Math.floor((Date.now() - new Date(sig.createdAt).getTime()) / 60000);

          return (
            <div
              key={`${sig.id}-${i}`}
              className="rounded-xl p-3"
              style={{
                background: SURFACE,
                border: `1px solid ${color}20`,
                borderLeft: `2px solid ${color}50`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${color}14`, border: `1px solid ${color}28` }}
                >
                  {brain?.icon ?? "◎"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono font-black text-sm" style={{ color: TEXT }}>{sig.ticker}</span>
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                      style={isBuy
                        ? { background: `${PROFIT}18`, color: PROFIT, border: `1px solid ${PROFIT}28` }
                        : { background: `${LOSS}18`,   color: LOSS,   border: `1px solid ${LOSS}28`   }}
                    >
                      {isBuy ? "▲ BUY" : "▼ SHORT"}
                    </span>
                    <span className="text-[7px] ml-auto" style={{ color: DIM }}>{timeAgo}m ago</span>
                  </div>
                  <div className="text-[8px] leading-relaxed mb-1.5" style={{ color: MUTED }}>
                    {sig.reasoning}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}
                    >
                      {brain?.name}
                    </span>
                    <span className="text-[7px]" style={{ color: DIM }}>{brain?.focus}</span>
                    <span className="text-[7px] font-bold ml-auto" style={{ color }}>
                      {(sig.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl mb-3 opacity-20" style={{ color: GOLD }}>◎</div>
            <div className="text-[9px] tracking-widest" style={{ color: DIM }}>NO SIGNALS FOR THIS BRAIN YET</div>
          </div>
        )}
      </div>
    </div>
  );
}
