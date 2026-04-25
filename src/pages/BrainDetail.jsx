import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS, generateSpark } from '../lib/hiveData';
import SparkLine from '../components/hive/SparkLine';
import HiveHeader from '../components/hive/HiveHeader';
import { format } from 'date-fns';

const TABS = [
  { id: "soul", label: "SOUL" },
  { id: "trades", label: "TRADES" },
  { id: "weakness", label: "WEAKNESS" },
  { id: "data", label: "DATA" },
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
          <div className="text-sm mb-4 font-bold" style={{ color: 'var(--hive-gold)' }}>← BRAIN GRID</div>
        </Link>
        <div className="hive-label" style={{ color: 'var(--hive-text-3)' }}>Brain not found.</div>
      </div>
    );
  }

  const { color, icon, name, focus, sin, sinGlyph, sinDesc, sinQuote, voice, tagline,
    balance, startingBalance, totalPnl, totalTrades, wonTrades, lostTrades,
    riskTolerance, avgHoldMinutes, signalSpeed, brainFocus, lastLesson,
    sinTraits, deficiencies, dataIn, watchlist } = brain;

  const pnlPct = startingBalance > 0 ? ((balance - startingBalance) / startingBalance) * 100 : 0;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col min-h-full">
      <HiveHeader
        title={name}
        subtitle={`${sin} · ${focus}`}
        back="/brains"
        backLabel="BRAIN GRID"
        accent={color}
        right={
          <div className="text-right">
            <div className="mono text-sm font-black" style={{ color }}>${balance.toFixed(0)}</div>
            <div
              className="mono text-[9px] font-bold"
              style={{ color: pnlPct >= 0 ? 'var(--hive-green)' : 'var(--hive-red)' }}
            >
              {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
            </div>
          </div>
        }
      />

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* Performance Card */}
        <div
          className="relative overflow-hidden rounded-xl p-4"
          style={{ background: 'var(--hive-surface-1)', border: `1px solid ${color}35`, boxShadow: `0 0 0 1px ${color}08` }}
        >
          {sinGlyph && (
            <div className="sin-watermark" style={{ color }}>{sinGlyph}</div>
          )}
          <div className="relative">
            <div className="mono text-2xl font-black mb-1" style={{ color }}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className="mono text-xs font-bold mb-3"
              style={{ color: totalPnl >= 0 ? 'var(--hive-green)' : 'var(--hive-red)' }}
            >
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              <span className="ml-1.5 opacity-70">({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
            </div>
            <div className="w-full mb-3">
              <SparkLine data={spark} width="100%" height={40} color={pnlPct >= 0 ? 'var(--hive-green)' : 'var(--hive-red)'} />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'TRADES', value: totalTrades,              color: 'var(--hive-text-1)' },
                { label: 'WIN %',  value: `${winRate}%`,            color: Number(winRate) >= 50 ? 'var(--hive-green)' : 'var(--hive-red)' },
                { label: 'WINS',   value: wonTrades,                 color: 'var(--hive-green)' },
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

        {/* Quote */}
        <div
          className="px-3 py-2.5 rounded-xl text-center text-[9px] font-mono italic"
          style={{ background: color + '08', border: `1px solid ${color}20`, color: color + 'cc' }}
        >
          {sinQuote}
        </div>

        {/* Tabs */}
        <div className="hive-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="hive-tab"
              style={tab === t.id ? {
                color,
                background: color + '0c',
                borderBottomColor: color,
              } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SOUL Tab */}
        {tab === "soul" && (
          <div className="space-y-3 pb-2">
            <div className="border-l-2 pl-3 py-1" style={{ borderColor: color }}>
              <div className="text-[8px] text-[#4a4a44] mb-1 tracking-widest">VOICE</div>
              <div className="text-[10px] font-bold font-mono" style={{ color }}>"{voice}"</div>
            </div>
            <div className="border-l-2 pl-3 py-1" style={{ borderColor: color }}>
              <div className="text-[8px] text-[#4a4a44] mb-1 tracking-widest">SIN — {sin}</div>
              <div className="text-[9px] text-[#7a7a74]">{sinDesc}</div>
            </div>

            <div>
              <div className="text-[8px] tracking-widest mb-2" style={{ color: color + "80" }}>SIN TRAITS</div>
              <ul className="space-y-2">
                {sinTraits.map((t, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span style={{ color }} className="text-[8px] mt-0.5 shrink-0">{sinGlyph}</span>
                    <span className="text-[9px] text-[#8a8a84] leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: color + '12' }}>
              {[
                { label: 'AVG HOLD', value: avgHoldMinutes >= 60 ? `${(avgHoldMinutes/60).toFixed(1)}h` : `${avgHoldMinutes}m` },
                { label: 'RISK',     value: `${(riskTolerance * 100).toFixed(0)}%`, bar: riskTolerance },
                { label: 'SIGNAL',   value: signalSpeed },
              ].map(s => (
                <div key={s.label} className="hive-stat-cell">
                  <div className="hive-stat-value" style={{ color }}>{s.value}</div>
                  <div className="hive-stat-label">{s.label}</div>
                  {s.bar != null && (
                    <div
                      className="mt-1.5 h-0.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--hive-border-1)' }}
                    >
                      <div className="h-full rounded-full" style={{ width: `${s.bar * 100}%`, background: color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {brainFocus && (
              <div
                className="rounded-xl p-3"
                style={{ background: 'var(--hive-surface-2)', border: '1px solid var(--hive-border-1)' }}
              >
                <div className="hive-sublabel mb-1">CURRENT FOCUS</div>
                <div className="text-[9px]" style={{ color }}>{brainFocus}</div>
              </div>
            )}
            {lastLesson && (
              <div
                className="rounded-xl p-3"
                style={{ background: 'var(--hive-surface-2)', border: '1px solid var(--hive-border-1)' }}
              >
                <div className="hive-sublabel mb-1">LAST LESSON</div>
                <div className="text-[9px]" style={{ color: 'var(--hive-text-1)' }}>{lastLesson}</div>
              </div>
            )}
            {brain.rlMethod && (
              <div
                className="rounded-xl p-3 space-y-1.5"
                style={{ background: 'var(--hive-surface-2)', border: `1px solid ${color}20` }}
              >
                <div className="hive-sublabel mb-1" style={{ color: color + '88' }}>RL ARCHITECTURE</div>
                <div className="flex items-center gap-2">
                  <span
                    className="hive-badge"
                    style={{ background: color + '12', color, border: `1px solid ${color}25` }}
                  >
                    {brain.rlMethod}
                  </span>
                  <span className="hive-sublabel">→</span>
                  <span className="text-[8px] font-bold" style={{ color: 'var(--hive-gold)' }}>{brain.rlReward}</span>
                </div>
                {brain.rlNotes && (
                  <div className="text-[8px] leading-relaxed" style={{ color: 'var(--hive-text-3)' }}>
                    {brain.rlNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRADES Tab */}
        {tab === "trades" && (
          <div className="space-y-2 pb-2">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "OPEN", value: trades.filter(t => t.status === "open").length, color: "#22c55e" },
                { label: "CLOSED", value: trades.filter(t => t.status === "closed").length, color: "#FFB81C" },
                { label: "REALIZED P&L", value: `${trades.filter(t=>t.status==="closed").reduce((s,t)=>s+(t.pnl??0),0) >= 0 ? "+" : ""}$${trades.filter(t=>t.status==="closed").reduce((s,t)=>s+(t.pnl??0),0).toFixed(2)}`, color: trades.filter(t=>t.status==="closed").reduce((s,t)=>s+(t.pnl??0),0) >= 0 ? "#22c55e" : "#ef4444" },
              ].map(s => (
                <div key={s.label} className="bg-[#111] rounded p-2 text-center">
                  <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[6px] text-[#3a3a3a] tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>

            {trades.length === 0 && (
              <div className="text-center py-10">
                <div className="text-xl mb-2 opacity-20">◎</div>
                <div className="text-[9px] text-[#333] tracking-widest">NO TRADES YET</div>
              </div>
            )}

            {trades.map(trade => {
              const isBuy = trade.action === "BUY";
              const isOpen = trade.status === "open";
              const pnlColor = (trade.pnl ?? 0) >= 0 ? "#22c55e" : "#ef4444";
              return (
                <div key={trade.id} className="bg-[#111] border rounded-lg p-3"
                  style={{ borderColor: isOpen ? color + "30" : "#1a1a1a" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono font-black text-xs text-[#d4d0c8]">{trade.ticker}</span>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${isBuy ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#ef444420] text-[#ef4444]"}`}>
                      {isBuy ? "▲ BUY" : "▼ SHORT"}
                    </span>
                    <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ml-auto ${isOpen ? "text-[#22c55e]" : trade.status === "cancelled" ? "text-[#ef4444]" : "text-[#FFB81C]"}`}>
                      {trade.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[7px] text-[#4a4a44]">ENTRY <span className="font-mono text-[#7a7a74]">${trade.entry_price?.toFixed(4)}</span></span>
                    {trade.exit_price != null && (
                      <span className="text-[7px] text-[#4a4a44]">EXIT <span className="font-mono text-[#7a7a74]">${trade.exit_price?.toFixed(4)}</span></span>
                    )}
                    {trade.pnl != null && (
                      <span className="text-[7px] font-bold mono ml-auto" style={{ color: pnlColor }}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {trade.opened_at && (
                    <div className="text-[6px] text-[#2a2a2a] mt-1">{format(new Date(trade.opened_at + 'Z'), 'MMM d, HH:mm')}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* WEAKNESS Tab */}
        {tab === "weakness" && (
          <div className="space-y-3 pb-2">
            <div
              className="text-[8px] border-l-2 pl-3 py-1"
              style={{ borderColor: 'var(--hive-red)', color: 'var(--hive-text-3)' }}
            >
              Every sin has a cost. These are {name}'s.
            </div>
            {deficiencies.map((d, i) => (
              <div
                key={i}
                className="rounded-xl p-3.5"
                style={{ background: 'var(--hive-surface-2)', border: '1px solid var(--hive-border-1)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[8px]" style={{ color: 'var(--hive-red)' }}>⚠</span>
                  <span className="text-[9px] font-bold" style={{ color: 'var(--hive-text-1)' }}>{d.label}</span>
                </div>
                <p className="text-[8px] leading-relaxed pl-4" style={{ color: 'var(--hive-text-3)' }}>{d.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* DATA Tab */}
        {tab === "data" && (
          <div className="space-y-4 pb-2">
            <div>
              <div className="hive-label mb-2" style={{ color: color + '88' }}>LIVE DATA FEEDS</div>
              <div className="space-y-2">
                {dataIn.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color, boxShadow: `0 0 4px ${color}`, animation: 'live-pulse 2s ease-in-out infinite' }}
                    />
                    <span className="text-[8px] mono" style={{ color: 'var(--hive-text-3)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="hive-label mb-2" style={{ color: color + '88' }}>WATCHLIST</div>
              <div className="grid grid-cols-4 gap-1.5">
                {watchlist.map(sym => (
                  <div
                    key={sym}
                    className="rounded-lg px-2 py-1.5 text-center"
                    style={{ background: 'var(--hive-surface-2)', border: `1px solid ${color}18` }}
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