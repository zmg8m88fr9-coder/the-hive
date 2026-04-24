import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAINS, HIVE_STATS, generateSignals, generateSpark } from '../lib/hiveData';
import SparkLine from '../components/hive/SparkLine';
import BrainCard from '../components/hive/BrainCard';

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

  const BRAIN_COLORS = {
    THE_BRAIN: "#FFB81C", APEX: "#ef4444", VENOM: "#a855f7",
    ORACLE: "#22c55e", GHOST: "#3b82f6", TITAN: "#f59e0b",
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black text-black"
                style={{ background: "linear-gradient(135deg, #FFB81C, #ef4444, #a855f7, #22c55e, #3b82f6, #f59e0b)" }}>
                H
              </div>
              <span className="text-sm font-black tracking-widest text-[#FFB81C]">THE HIVE</span>
            </div>
            <div className="text-[8px] text-[#6b6860]">6 Markets · Neural Web · $3K→$600K</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e] font-bold tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Hive Balance */}
        <div className="bg-[#0d0d0d] border border-[#FFB81C20] rounded-xl p-4">
          <div className="text-[8px] text-[#6b6860] tracking-widest mb-1">HIVE BALANCE</div>
          <div className="mono text-2xl font-black text-[#FFB81C]">
            ${HIVE_STATS.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`mono text-xs font-bold ${HIVE_STATS.totalPnl >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {HIVE_STATS.totalPnl >= 0 ? "+" : ""}${HIVE_STATS.totalPnl.toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
          </div>
          <div className="text-[8px] text-[#6b6860] mt-0.5">{HIVE_STATS.totalTrades} total trades · 6 specialists active</div>

          {/* Mini hive stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#1a1a1a]">
            {[
              { label: "BALANCE", value: `$${(HIVE_STATS.totalBalance).toFixed(0)}`, color: "#FFB81C" },
              { label: "TOTAL P&L", value: `+$${HIVE_STATS.totalPnl.toFixed(0)}`, color: "#22c55e" },
              { label: "TRADES", value: HIVE_STATS.totalTrades, color: "#d4d0c8" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="mono text-sm font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[7px] text-[#4a4a44]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Signals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] font-bold tracking-widest text-[#6b6860]">LIVE SIGNALS</div>
            <Link to="/signals">
              <span className="text-[8px] text-[#FFB81C]">VIEW ALL →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {latestSignals.map(sig => {
              const brain = BRAINS.find(b => b.id === sig.brainId);
              const color = brain?.color ?? "#FFB81C";
              const isBuy = sig.action === "BUY";
              return (
                <div key={sig.id} className="bg-[#0d0d0d] border rounded-lg px-3 py-2 flex items-center gap-3"
                  style={{ borderColor: color + "25" }}>
                  <span className="text-sm">{brain?.icon ?? "◎"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="mono font-black text-xs text-[#d4d0c8]">{sig.ticker}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isBuy ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#ef444420] text-[#ef4444]"}`}>
                        {isBuy ? "▲ BUY" : "▼ SHORT"}
                      </span>
                    </div>
                    <div className="text-[8px] text-[#6b6860] truncate mt-0.5">{sig.reasoning.slice(0, 55)}...</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="mono text-[9px] font-bold" style={{ color }}>
                      {(sig.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-[7px] text-[#4a4a44]">{brain?.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Specialists Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] font-bold tracking-widest text-[#6b6860]">6 SPECIALISTS</div>
            <Link to="/brains">
              <span className="text-[8px] text-[#FFB81C]">FULL GRID →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {BRAINS.map(brain => (
              <BrainCard key={brain.id} brain={brain} compact />
            ))}
          </div>
        </div>

        {/* Sin Grid */}
        <div>
          <div className="text-[9px] font-bold tracking-widest text-[#6b6860] mb-2">BROTHERHOOD OF SINS</div>
          <div className="grid grid-cols-3 gap-2">
            {BRAINS.map(b => (
              <Link key={b.id} to={`/brains/${b.id}`}>
                <div className="bg-[#0d0d0d] border rounded-lg p-2.5 text-center active:scale-95 transition-all"
                  style={{ borderColor: b.color + "30" }}>
                  <div className="text-xl mb-0.5" style={{ color: b.color }}>{b.sinGlyph}</div>
                  <div className="text-[8px] font-bold tracking-widest" style={{ color: b.color }}>{b.sin}</div>
                  <div className="text-[7px] text-[#4a4a44]">{b.focus}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}