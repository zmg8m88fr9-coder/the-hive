import { useState } from 'react';
import { Link } from 'react-router-dom';
import { INDICATOR_LIST } from '../lib/indicatorAgents';
import { BRAINS } from '../lib/hiveData';

const ALL_BRAINS = ['ALL', ...BRAINS.map(b => b.id)];

export default function IndicatorHub() {
  const [brainFilter, setBrainFilter] = useState('ALL');

  const visible = brainFilter === 'ALL'
    ? INDICATOR_LIST
    : INDICATOR_LIST.filter(ind => ind.primaryBrains.includes(brainFilter));

  const activeBrain = BRAINS.find(b => b.id === brainFilter);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#FFB81C]">INDICATOR AGENTS</h1>
            <div className="text-[8px] text-[#6b6860]">
              {visible.length} agents · {brainFilter === 'ALL' ? '6 brains' : activeBrain?.name}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e] font-bold tracking-widest">LIVE</span>
          </div>
        </div>

        {/* Brain filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {ALL_BRAINS.map(id => {
            const brain = BRAINS.find(b => b.id === id);
            const color = brain?.color ?? '#FFB81C';
            const active = brainFilter === id;
            return (
              <button key={id} onClick={() => setBrainFilter(id)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: color + '25', border: `1px solid ${color}60`, color }
                  : { background: 'transparent', border: '1px solid #1e1e1e', color: '#4a4a44' }}>
                {brain ? <><span>{brain.icon}</span><span>{brain.name.replace('THE_','')}</span></> : 'ALL'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-2">
        <div className="text-[7px] text-[#333] pb-1">
          One indicator agent per tracked signal type. Each agent is brain-aware and loads the active brain's watchlist.
        </div>

        {visible.map(ind => {
          const topBrain = BRAINS.find(b => ind.primaryBrains.includes(b.id));
          return (
            <Link key={ind.id} to={`/indicators/${ind.id}`}>
              <div className="bg-[#0d0d0d] border rounded-xl p-3 mb-2 active:opacity-80 transition-opacity"
                style={{ borderColor: ind.color + '25' }}>
                <div className="flex items-start gap-2.5">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: ind.color + '15', border: `1px solid ${ind.color}30` }}>
                    {ind.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[9px] font-black tracking-widest" style={{ color: ind.color }}>
                        {ind.label}
                      </span>
                      <span className="text-[6px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: ind.color + '15', color: ind.color + 'aa', border: `1px solid ${ind.color}25` }}>
                        {ind.shortLabel}
                      </span>
                    </div>
                    <div className="text-[7px] text-[#6a6a64] leading-snug mb-1.5">{ind.description}</div>

                    {/* Primary brains */}
                    <div className="flex gap-1 flex-wrap">
                      {ind.primaryBrains.slice(0, 4).map(bId => {
                        const b = BRAINS.find(x => x.id === bId);
                        if (!b) return null;
                        return (
                          <span key={bId}
                            className="text-[6px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: b.color + '15', color: b.color, border: `1px solid ${b.color}30` }}>
                            {b.icon} {b.name.replace('THE_', '')}
                          </span>
                        );
                      })}
                      {ind.primaryBrains.length > 4 && (
                        <span className="text-[6px] text-[#4a4a44]">+{ind.primaryBrains.length - 4}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-[#333] text-sm flex-shrink-0 mt-1">→</div>
                </div>

                {/* Bottom: delay + reliability */}
                <div className="mt-2.5 pt-2 border-t flex items-center justify-between"
                  style={{ borderColor: ind.color + '12' }}>
                  <span className="text-[6px] text-[#333] truncate pr-2">{ind.dataDelay.split('·')[0].trim()}</span>
                  <span className="text-[6px] font-bold flex-shrink-0" style={{ color: ind.color + 'aa' }}>
                    {ind.reliability}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
