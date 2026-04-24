import { useState, useEffect } from 'react';
import { BRAINS, generateSignals } from '../lib/hiveData';

const BRAIN_FILTER = ["ALL", "THE_BRAIN", "APEX", "VENOM", "ORACLE", "GHOST", "TITAN"];

export default function HiveSignals() {
  const [signals, setSignals] = useState(() => generateSignals());
  const [filter, setFilter] = useState("ALL");

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
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#FFB81C]">SIGNAL FEED</h1>
            <div className="text-[8px] text-[#6b6860]">Real-time trading signals from all 6 brains</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e]">LIVE</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {BRAIN_FILTER.map(id => {
            const brain = BRAINS.find(b => b.id === id);
            const color = brain?.color ?? "#FFB81C";
            const active = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: color + "25", border: `1px solid ${color}60`, color }
                  : { background: "transparent", border: "1px solid #222", color: "#6b6860" }}>
                {id === "ALL" ? "ALL" : id.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2">
        {filtered.map((sig, i) => {
          const brain = BRAINS.find(b => b.id === sig.brainId);
          const color = brain?.color ?? "#FFB81C";
          const isBuy = sig.action === "BUY";
          const timeAgo = Math.floor((Date.now() - new Date(sig.createdAt).getTime()) / 60000);

          return (
            <div key={`${sig.id}-${i}`} className="bg-[#0d0d0d] border rounded-xl p-3"
              style={{ borderColor: color + "25" }}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: color + "15", border: `1px solid ${color}30` }}>
                  {brain?.icon ?? "◎"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono font-black text-sm text-[#d4d0c8]">{sig.ticker}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isBuy ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#ef444420] text-[#ef4444]"}`}>
                      {isBuy ? "▲ BUY" : "▼ SHORT"}
                    </span>
                    <span className="text-[8px] text-[#4a4a44] ml-auto">{timeAgo}m ago</span>
                  </div>
                  <div className="text-[8px] text-[#6a6a64] leading-relaxed mb-1.5">{sig.reasoning}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: color + "15", color, border: `1px solid ${color}30` }}>
                      {brain?.name}
                    </span>
                    <span className="text-[7px] text-[#4a4a44]">{brain?.focus}</span>
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
          <div className="text-center py-12 text-[#6b6860] text-[10px]">No signals for this brain yet.</div>
        )}
      </div>
    </div>
  );
}