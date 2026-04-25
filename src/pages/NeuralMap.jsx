import { useState, useEffect, useRef } from 'react';
import { BRAINS } from '../lib/hiveData';

const BONDS = [
  { from: "THE_BRAIN", to: "VENOM",   type: "feed",    label: "stock call → options play" },
  { from: "THE_BRAIN", to: "GHOST",   type: "feed",    label: "equity sector → futures" },
  { from: "APEX",      to: "ORACLE",  type: "feed",    label: "crypto risk-on/off → forex" },
  { from: "GHOST",     to: "THE_BRAIN", type: "lead",  label: "futures lead equity direction" },
  { from: "ORACLE",    to: "TITAN",   type: "feed",    label: "DXY → commodity ETFs" },
  { from: "TITAN",     to: "THE_BRAIN", type: "share", label: "sector rotation → stocks" },
  { from: "VENOM",     to: "APEX",    type: "feed",    label: "equity IV → crypto vol" },
  { from: "APEX",      to: "GHOST",   type: "lead",    label: "BTC leads ES/NQ" },
];

const BOND_COLORS = {
  feed: "#C8892A", lead: "#C04438", share: "#3A74D4", confirm: "#8A54E0",
};

const TABS = [
  { id: "soul", label: "SOUL" },
  { id: "brotherhood", label: "BONDS" },
  { id: "weakness", label: "WEAK" },
];

// Positions arranged in a hex/circle pattern
const POSITIONS = {
  THE_BRAIN: { x: 50, y: 12 },
  APEX:      { x: 84, y: 33 },
  VENOM:     { x: 84, y: 67 },
  ORACLE:    { x: 50, y: 88 },
  GHOST:     { x: 16, y: 67 },
  TITAN:     { x: 16, y: 33 },
};

export default function NeuralMap() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("soul");
  const containerRef = useRef(null);
  const [dim, setDim] = useState({ w: 300, h: 280 });

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      setDim({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const brain = BRAINS.find(b => b.id === selected) ?? null;
  const coords = (id) => {
    const pos = POSITIONS[id];
    return { x: (pos.x / 100) * dim.w, y: (pos.y / 100) * dim.h };
  };

  const myBonds = brain ? BONDS.filter(b => b.from === brain.id || b.to === brain.id) : [];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#C8892A]">NEURAL MAP</h1>
            <div className="text-[8px] text-[#8A7F6D]">The 6 Sinful Brains — Brothers in Money</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E9E6B] animate-pulse" />
            <span className="text-[8px] text-[#3E9E6B]">HIVE LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* SVG Map */}
        <div ref={containerRef} className="w-full bg-[#030303] border border-[#111] rounded-xl overflow-hidden" style={{ height: 280 }}>
          <svg width="100%" height="100%">
            {/* Center glow */}
            <circle cx={dim.w/2} cy={dim.h/2} r={20} fill="#C8892A" opacity={0.04} />
            <circle cx={dim.w/2} cy={dim.h/2} r={12} fill="#C8892A" opacity={0.06} />
            <text x={dim.w/2} y={dim.h/2 + 4} textAnchor="middle" fontSize={6} fill="#C8892A" opacity={0.25}
              fontFamily="JetBrains Mono, monospace" letterSpacing="3">HIVE</text>

            {/* Bond lines */}
            {BONDS.map((bond, i) => {
              const a = coords(bond.from);
              const b2 = coords(bond.to);
              const isHighlit = selected === bond.from || selected === bond.to;
              const bondColor = isHighlit ? (BOND_COLORS[bond.type] ?? "#C8892A") : "#2B2216";
              return (
                <line key={i}
                  x1={a.x} y1={a.y} x2={b2.x} y2={b2.y}
                  stroke={bondColor}
                  strokeWidth={isHighlit ? 2 : 0.8}
                  strokeDasharray={isHighlit ? "none" : "3 5"}
                  opacity={isHighlit ? 0.8 : 0.5}
                />
              );
            })}

            {/* Brain nodes */}
            {BRAINS.map(b => {
              const c = coords(b.id);
              const isSelected = selected === b.id;
              const R = 22;
              return (
                <g key={b.id} onClick={() => { setSelected(selected === b.id ? null : b.id); setTab("soul"); }}
                  style={{ cursor: "pointer" }}>
                  <circle cx={c.x} cy={c.y} r={R + 12} fill={b.color} opacity={isSelected ? 0.08 : 0.03} />
                  <circle cx={c.x} cy={c.y} r={R} fill="#060606" stroke={b.color}
                    strokeWidth={isSelected ? 2 : 1.2} />
                  <circle cx={c.x} cy={c.y} r={R - 5} fill={b.color} opacity={0.06} />
                  <text x={c.x} y={c.y - 7} textAnchor="middle" fontSize={6} fill={b.color}
                    fontFamily="JetBrains Mono, monospace" opacity={0.6} letterSpacing="1">
                    {b.sin}
                  </text>
                  <text x={c.x} y={c.y + 3} textAnchor="middle" fontSize={7} fill={b.color}
                    fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    {b.name === "THE BRAIN" ? "BRAIN" : b.name}
                  </text>
                  <text x={c.x} y={c.y + 11} textAnchor="middle" fontSize={5} fill={b.color}
                    fontFamily="JetBrains Mono, monospace" opacity={0.4}>
                    {b.focus}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Quick-select */}
        <div className="grid grid-cols-6 gap-1.5">
          {BRAINS.map(b => (
            <button key={b.id}
              onClick={() => { setSelected(selected === b.id ? null : b.id); setTab("soul"); }}
              className="rounded-lg p-2 text-center transition-all border active:scale-95"
              style={{
                borderColor: selected === b.id ? b.color + "60" : b.color + "20",
                background: selected === b.id ? b.color + "10" : "#080808",
              }}>
              <div className="text-sm mb-0.5" style={{ color: b.color }}>{b.sinGlyph}</div>
              <div className="text-[6px] font-bold" style={{ color: b.color }}>{b.sin}</div>
            </button>
          ))}
        </div>

        {/* Brain Detail Panel */}
        {brain && (
          <div className="bg-[#0B0905] border rounded-xl overflow-hidden" style={{ borderColor: brain.color + "30" }}>
            {/* Panel header */}
            <div className="px-4 py-3 border-b flex items-start justify-between"
              style={{ borderColor: brain.color + "18", background: brain.color + "06" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-black tracking-widest" style={{ color: brain.color }}>{brain.sin}</span>
                  <span className="text-[8px] px-2 py-0.5 rounded-full border font-bold"
                    style={{ borderColor: brain.color + "40", color: brain.color, background: brain.color + "10" }}>
                    {brain.name}
                  </span>
                </div>
                <div className="text-[9px] italic text-[#8A7F6D]">{brain.tagline}</div>
                <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: brain.color }}>"{brain.voice}"</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#4D4538] text-sm">✕</button>
            </div>

            {/* Quote */}
            <div className="px-4 py-2 border-b text-[8px] font-mono text-center"
              style={{ borderColor: brain.color + "12", color: brain.color + "aa" }}>
              {brain.sinQuote}
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: brain.color + "12" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex-1 py-2 text-[8px] font-bold tracking-widest transition-all"
                  style={{
                    color: tab === t.id ? brain.color : "#4D4538",
                    background: tab === t.id ? brain.color + "0c" : "transparent",
                    borderBottom: tab === t.id ? `1.5px solid ${brain.color}` : "1.5px solid transparent",
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {tab === "soul" && (
                <div className="space-y-3">
                  <ul className="space-y-2">
                    {brain.sinTraits.map((t, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span style={{ color: brain.color }} className="text-[8px] shrink-0">{brain.sinGlyph}</span>
                        <span className="text-[8px] text-[#8A7F6D] leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: brain.color + "12" }}>
                    {[
                      { label: "RISK", value: `${(brain.riskTolerance * 100).toFixed(0)}%` },
                      { label: "HOLD", value: brain.avgHoldMinutes >= 60 ? `${(brain.avgHoldMinutes/60).toFixed(1)}h` : `${brain.avgHoldMinutes}m` },
                      { label: "SPEED", value: brain.signalSpeed },
                    ].map(s => (
                      <div key={s.label} className="bg-[#0B0905] rounded p-2 text-center">
                        <div className="mono text-sm font-black" style={{ color: brain.color }}>{s.value}</div>
                        <div className="text-[7px] text-[#4D4538]">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "brotherhood" && (
                <div className="space-y-2">
                  {myBonds.map((bond, i) => {
                    const isOut = bond.from === brain.id;
                    const peerId = isOut ? bond.to : bond.from;
                    const peer = BRAINS.find(b2 => b2.id === peerId);
                    const bcolor = BOND_COLORS[bond.type] ?? brain.color;
                    return (
                      <div key={i} className="flex items-center gap-2 bg-[#0B0905] rounded px-2 py-2">
                        <span className="text-[9px] font-bold" style={{ color: peer?.color }}>{peer?.name}</span>
                        <span className="text-[7px] px-1.5 py-0.5 rounded"
                          style={{ background: bcolor + "18", color: bcolor }}>{bond.type}</span>
                        <span className="text-[7px] text-[#4D4538] flex-1 truncate">{bond.label}</span>
                        <span className="text-[7px] font-mono" style={{ color: isOut ? brain.color : peer?.color }}>
                          {isOut ? "▸" : "◂"}
                        </span>
                      </div>
                    );
                  })}
                  {myBonds.length === 0 && (
                    <div className="text-[8px] text-[#4D4538] text-center py-3">No direct bonds shown</div>
                  )}
                </div>
              )}

              {tab === "weakness" && (
                <div className="space-y-2">
                  {brain.deficiencies.map((d, i) => (
                    <div key={i} className="bg-[#0B0905] border border-[#141414] rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] text-[#C04438]">⚠</span>
                        <span className="text-[8px] font-bold text-[#DDD6C4]">{d.label}</span>
                      </div>
                      <p className="text-[7px] text-[#4D4538] leading-relaxed pl-4">{d.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}