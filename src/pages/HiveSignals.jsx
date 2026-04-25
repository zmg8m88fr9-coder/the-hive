import { useState, useEffect } from 'react';
import { BRAINS, generateSignals } from '../lib/hiveData';
import HiveHeader from '../components/hive/HiveHeader';

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
      <HiveHeader
        title="SIGNAL FEED"
        subtitle="Real-time trading signals from all 6 brains"
        live
      >
        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {BRAIN_FILTER.map(id => {
            const brain = BRAINS.find(b => b.id === id);
            const color = brain?.color ?? 'var(--hive-gold)';
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="flex-shrink-0 hive-pill transition-all"
                style={active ? { background: color + '22', borderColor: color + '55', color } : {}}
              >
                {id === 'ALL' ? 'ALL' : id.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </HiveHeader>

      <div className="px-4 pt-3 pb-6 space-y-2">
        {filtered.map((sig, i) => {
          const brain = BRAINS.find(b => b.id === sig.brainId);
          const color = brain?.color ?? "#FFB81C";
          const isBuy = sig.action === "BUY";
          const timeAgo = Math.floor((Date.now() - new Date(sig.createdAt).getTime()) / 60000);

          return (
            <div
              key={`${sig.id}-${i}`}
              className="rounded-xl p-3"
              style={{ background: 'var(--hive-surface-1)', border: `1px solid ${color}22` }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: color + '12', border: `1px solid ${color}28` }}
                >
                  {brain?.icon ?? '◎'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono font-black text-sm" style={{ color: 'var(--hive-text-0)' }}>
                      {sig.ticker}
                    </span>
                    <span className={`hive-badge ${isBuy ? 'hive-badge-buy' : 'hive-badge-sell'}`}>
                      {isBuy ? '▲ BUY' : '▼ SHORT'}
                    </span>
                    <span className="text-[7px] ml-auto" style={{ color: 'var(--hive-text-4)' }}>
                      {timeAgo}m ago
                    </span>
                  </div>
                  <div
                    className="text-[8px] leading-relaxed mb-1.5"
                    style={{ color: 'var(--hive-text-3)' }}
                  >
                    {sig.reasoning}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="hive-badge"
                      style={{ background: color + '12', color, border: `1px solid ${color}25` }}
                    >
                      {brain?.name}
                    </span>
                    <span className="text-[7px]" style={{ color: 'var(--hive-text-4)' }}>{brain?.focus}</span>
                    <span className="mono text-[7px] font-bold ml-auto" style={{ color }}>
                      {(sig.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 hive-label" style={{ color: 'var(--hive-text-3)' }}>
            No signals for this brain yet.
          </div>
        )}
      </div>
    </div>
  );
}