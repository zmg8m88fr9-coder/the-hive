import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS, generateSpark } from '../lib/hiveData';
import SparkLine from '../components/hive/SparkLine';
import { format } from 'date-fns';

const VOID     = '#0B0905';
const SURFACE  = '#131009';
const ELEVATED = '#1A1510';
const BORDER   = '#2B2216';
const TEXT     = '#DDD6C4';
const MUTED    = '#8A7F6D';
const DIM      = '#4D4538';
const GOLD     = '#C8892A';
const PROFIT   = '#3E9E6B';
const LOSS     = '#C04438';

const TABS = [
  { id: "soul",     label: "SOUL"     },
  { id: "trades",   label: "TRADES"   },
  { id: "weakness", label: "WEAKNESS" },
  { id: "data",     label: "DATA"     },
];

export default function BrainDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState("soul");
  const brain = BRAINS.find(b => b.id === id);

  const { data: trades = [] } = useQuery({
    queryKey: ['trades', id],
    queryFn: () => base44.entities.Trade.filter({ brain_id: id }, '-opened_at', 50),
  });

  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const spark = useMemo(() => {
    if (!brain) return [];
    const pct = ((brain.balance - brain.startingBalance) / brain.startingBalance) * 100;
    return generateSpark(30, pct > 0 ? 1 : -1, seed);
  }, [id]);

  if (!brain) {
    return (
      <div className="p-4 pt-16">
        <Link to="/brains">
          <div className="text-sm mb-4 font-bold" style={{ color: GOLD }}>← BACK</div>
        </Link>
        <div style={{ color: MUTED }}>Brain not found.</div>
      </div>
    );
  }

  const {
    color, icon, name, focus, sin, sinGlyph, sinDesc, sinQuote, voice, tagline,
    balance, startingBalance, totalPnl, totalTrades, wonTrades, lostTrades,
    riskTolerance, avgHoldMinutes, signalSpeed, brainFocus, lastLesson,
    sinTraits, deficiencies, dataIn, watchlist,
  } = brain;

  const pnlPct  = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : "0.0";
  const pnlColor = pnlPct >= 0 ? PROFIT : LOSS;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3"
        style={{ background: VOID, borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-3">
          <Link to="/brains">
            <span className="text-sm font-bold" style={{ color: MUTED }}>←</span>
          </Link>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: `${color}14`, border: `1px solid ${color}28` }}
          >
            {icon}
          </div>
          <div>
            <div className="text-sm font-black tracking-widest" style={{ color }}>{name}</div>
            <div className="text-[8px]" style={{ color: MUTED }}>{sin} · {focus}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="mono text-sm font-black" style={{ color }}>${balance.toFixed(0)}</div>
            <div className="mono text-[9px] font-bold" style={{ color: pnlColor }}>
              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* Performance Card */}
        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(145deg, ${SURFACE} 0%, #161208 100%)`,
            border: `1px solid ${color}38`,
            boxShadow: `0 2px 20px ${color}08, inset 0 1px 0 ${color}08`,
          }}
        >
          <div className="mono text-2xl font-black mb-0.5" style={{ color }}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mono text-xs font-bold mb-3" style={{ color: pnlColor }}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}&nbsp;
            <span className="text-[9px]">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)</span>
          </div>

          <div className="w-full mb-3">
            <SparkLine data={spark} width="100%" height={40} color={pnlColor} />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "TRADES", value: totalTrades,                                         color: TEXT   },
              { label: "WIN %",  value: `${winRate}%`, color: Number(winRate) >= 50 ? PROFIT : LOSS },
              { label: "WINS",   value: wonTrades,                                            color: PROFIT },
              { label: "RISK",   value: `${(riskTolerance * 100).toFixed(0)}%`,             color: '#8A54E0' },
            ].map(s => (
              <div key={s.label} className="stat-cell">
                <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[7px] tracking-widest" style={{ color: DIM }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sin Quote */}
        <div
          className="px-4 py-3 rounded-xl text-center text-[9px] font-mono italic leading-relaxed"
          style={{
            background: `${color}08`,
            border: `1px solid ${color}18`,
            color: color + 'cc',
          }}
        >
          {sinQuote}
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: `1px solid ${BORDER}` }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 text-[8px] font-bold tracking-widest transition-all duration-150"
              style={{
                color:        tab === t.id ? color : DIM,
                background:   tab === t.id ? `${color}0c` : 'transparent',
                borderBottom: tab === t.id ? `1.5px solid ${color}` : `1.5px solid transparent`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SOUL Tab ────────────────────────────────── */}
        {tab === "soul" && (
          <div className="space-y-3 pb-2">
            <div className="pl-3 py-1" style={{ borderLeft: `2px solid ${color}` }}>
              <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>VOICE</div>
              <div className="text-[10px] font-bold mono" style={{ color }}>"{voice}"</div>
            </div>
            <div className="pl-3 py-1" style={{ borderLeft: `2px solid ${color}` }}>
              <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>SIN — {sin}</div>
              <div className="text-[9px]" style={{ color: MUTED }}>{sinDesc}</div>
            </div>

            <div>
              <div className="text-[8px] tracking-widest mb-2" style={{ color: color + '70' }}>SIN TRAITS</div>
              <ul className="space-y-2">
                {sinTraits.map((t, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-[8px] mt-0.5 shrink-0" style={{ color }}>{sinGlyph}</span>
                    <span className="text-[9px] leading-relaxed" style={{ color: MUTED }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: `1px solid ${color}12` }}>
              <div className="stat-cell">
                <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>AVG HOLD</div>
                <div className="text-sm font-black mono" style={{ color }}>
                  {avgHoldMinutes >= 60 ? `${(avgHoldMinutes / 60).toFixed(1)}h` : `${avgHoldMinutes}m`}
                </div>
              </div>
              <div className="stat-cell">
                <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>RISK</div>
                <div className="text-sm font-black mono" style={{ color }}>{(riskTolerance * 100).toFixed(0)}%</div>
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${riskTolerance * 100}%`, background: color }} />
                </div>
              </div>
              <div className="stat-cell">
                <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>SIGNAL</div>
                <div className="text-sm font-black mono" style={{ color }}>{signalSpeed}</div>
              </div>
            </div>

            {brainFocus && (
              <div className="rounded-lg p-3" style={{ background: ELEVATED }}>
                <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>CURRENT FOCUS</div>
                <div className="text-[9px]" style={{ color }}>{brainFocus}</div>
              </div>
            )}
            {lastLesson && (
              <div className="rounded-lg p-3" style={{ background: ELEVATED }}>
                <div className="text-[7px] tracking-widest mb-1" style={{ color: DIM }}>LAST LESSON</div>
                <div className="text-[9px]" style={{ color: TEXT }}>{lastLesson}</div>
              </div>
            )}
            {brain.rlMethod && (
              <div
                className="rounded-lg p-3 space-y-1.5"
                style={{ background: ELEVATED, border: `1px solid ${color}18` }}
              >
                <div className="text-[7px] tracking-widest mb-1" style={{ color: color + '70' }}>RL ARCHITECTURE</div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${color}14`, color }}
                  >
                    {brain.rlMethod}
                  </span>
                  <span style={{ color: DIM }}>→</span>
                  <span className="text-[8px] font-bold" style={{ color: GOLD }}>{brain.rlReward}</span>
                </div>
                {brain.rlNotes && (
                  <div className="text-[8px] leading-relaxed" style={{ color: MUTED }}>{brain.rlNotes}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TRADES Tab ──────────────────────────────── */}
        {tab === "trades" && (
          <div className="space-y-2 pb-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "OPEN",   value: trades.filter(t => t.status === "open").length,   color: PROFIT },
                { label: "CLOSED", value: trades.filter(t => t.status === "closed").length, color: GOLD  },
                {
                  label: "REALIZED P&L",
                  value: (() => {
                    const r = trades.filter(t => t.status === "closed").reduce((s, t) => s + (t.pnl ?? 0), 0);
                    return `${r >= 0 ? "+" : ""}$${r.toFixed(2)}`;
                  })(),
                  color: trades.filter(t => t.status === "closed").reduce((s, t) => s + (t.pnl ?? 0), 0) >= 0 ? PROFIT : LOSS,
                },
              ].map(s => (
                <div key={s.label} className="stat-cell">
                  <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[6px] tracking-widest" style={{ color: DIM }}>{s.label}</div>
                </div>
              ))}
            </div>

            {trades.length === 0 && (
              <div className="text-center py-10">
                <div className="text-2xl mb-3 opacity-20" style={{ color }}>◎</div>
                <div className="text-[9px] tracking-widest" style={{ color: DIM }}>NO TRADES YET</div>
              </div>
            )}

            {trades.map(trade => {
              const isBuy   = trade.action === "BUY";
              const isOpen  = trade.status === "open";
              const pnlC    = (trade.pnl ?? 0) >= 0 ? PROFIT : LOSS;
              return (
                <div
                  key={trade.id}
                  className="rounded-lg p-3"
                  style={{
                    background: ELEVATED,
                    border: `1px solid ${isOpen ? color + '30' : BORDER}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="mono font-black text-xs" style={{ color: TEXT }}>{trade.ticker}</span>
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                      style={isBuy
                        ? { background: `${PROFIT}18`, color: PROFIT, border: `1px solid ${PROFIT}28` }
                        : { background: `${LOSS}18`,   color: LOSS,   border: `1px solid ${LOSS}28`   }}
                    >
                      {isBuy ? "▲ BUY" : "▼ SHORT"}
                    </span>
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded ml-auto"
                      style={{ color: isOpen ? PROFIT : trade.status === "cancelled" ? LOSS : GOLD }}
                    >
                      {trade.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[7px]" style={{ color: DIM }}>
                      ENTRY <span className="mono" style={{ color: MUTED }}>${trade.entry_price?.toFixed(4)}</span>
                    </span>
                    {trade.exit_price != null && (
                      <span className="text-[7px]" style={{ color: DIM }}>
                        EXIT <span className="mono" style={{ color: MUTED }}>${trade.exit_price?.toFixed(4)}</span>
                      </span>
                    )}
                    {trade.pnl != null && (
                      <span className="text-[7px] font-bold mono ml-auto" style={{ color: pnlC }}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {trade.opened_at && (
                    <div className="text-[6px] mt-1" style={{ color: DIM }}>
                      {format(new Date(trade.opened_at + 'Z'), 'MMM d, HH:mm')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── WEAKNESS Tab ────────────────────────────── */}
        {tab === "weakness" && (
          <div className="space-y-3 pb-2">
            <div
              className="pl-3 py-1 text-[8px]"
              style={{ borderLeft: `2px solid ${LOSS}`, color: MUTED }}
            >
              Every sin has a cost. These are {name}'s.
            </div>
            {deficiencies.map((d, i) => (
              <div
                key={i}
                className="rounded-lg p-3.5"
                style={{ background: ELEVATED, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[8px]" style={{ color: LOSS }}>⚠</span>
                  <span className="text-[9px] font-bold" style={{ color: TEXT }}>{d.label}</span>
                </div>
                <p className="text-[8px] leading-relaxed pl-4" style={{ color: MUTED }}>{d.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── DATA Tab ────────────────────────────────── */}
        {tab === "data" && (
          <div className="space-y-3 pb-2">
            <div>
              <div className="text-[8px] tracking-widest mb-2" style={{ color: color + '60' }}>LIVE DATA FEEDS</div>
              {dataIn.map((d, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[8px] mono" style={{ color: MUTED }}>{d}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[8px] tracking-widest mb-2" style={{ color: color + '60' }}>WATCHLIST</div>
              <div className="grid grid-cols-4 gap-1.5">
                {watchlist.map(sym => (
                  <div
                    key={sym}
                    className="rounded px-2 py-1.5 text-center"
                    style={{ background: ELEVATED, border: `1px solid ${BORDER}` }}
                  >
                    <div className="mono text-[9px] font-bold" style={{ color }}>{sym}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
