import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from 'react';

const METRICS = [
  { key: 'winRate', label: 'WIN RATE', max: 100, format: v => `${v.toFixed(1)}%` },
  { key: 'roi', label: 'ROI %', max: null, format: v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` },
  { key: 'avgWin', label: 'AVG WIN $', max: null, format: v => `+$${v.toFixed(2)}` },
  { key: 'profitFactor', label: 'PROFIT FACTOR', max: 5, format: v => v.toFixed(2) },
  { key: 'totalPnl', label: 'TOTAL P&L', max: null, format: v => `${v >= 0 ? '+' : ''}$${v.toFixed(2)}` },
  { key: 'totalTrades', label: 'TRADE COUNT', max: null, format: v => v },
];

function normalize(value, max, allValues) {
  const realMax = max ?? Math.max(...allValues.filter(v => v > 0), 1);
  const realMin = Math.min(...allValues.filter(v => v !== Infinity), 0);
  if (realMax === realMin) return 50;
  return Math.min(100, Math.max(0, ((value - realMin) / (realMax - realMin)) * 100));
}

export default function StrategyComparison({ brainStats }) {
  const [selected, setSelected] = useState(new Set(brainStats.slice(0, 3).map(s => s.brain.id)));

  const toggleBrain = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const activeBrains = brainStats.filter(s => selected.has(s.brain.id));

  // Build radar data
  const radarData = METRICS.map(metric => {
    const allValues = brainStats.map(s => s[metric.key]);
    const point = { metric: metric.label };
    brainStats.forEach(s => {
      point[s.brain.id] = normalize(s[metric.key], metric.max, allValues);
    });
    return point;
  });

  return (
    <div className="space-y-3">
      {/* Brain toggles */}
      <div className="flex gap-1.5 flex-wrap">
        {brainStats.map(({ brain }) => {
          const on = selected.has(brain.id);
          return (
            <button key={brain.id} onClick={() => toggleBrain(brain.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
              style={{
                background: on ? brain.color + '20' : '#0d0d0d',
                border: `1px solid ${on ? brain.color + '60' : '#1a1a1a'}`,
                color: on ? brain.color : '#333',
              }}>
              <span>{brain.icon}</span>
              <span>{brain.name}</span>
            </button>
          );
        })}
      </div>

      {/* Radar chart */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
        <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">STRATEGY RADAR (NORMALIZED)</div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#1a1a1a" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#444', fontSize: 6, fontFamily: 'JetBrains Mono' }} />
            {activeBrains.map(({ brain }) => (
              <Radar key={brain.id} name={brain.name} dataKey={brain.id}
                stroke={brain.color} fill={brain.color} fillOpacity={0.08} strokeWidth={1.5}
                dot={{ r: 2, fill: brain.color }} />
            ))}
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 7, fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#6b6860' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-1 justify-center">
          {activeBrains.map(({ brain }) => (
            <div key={brain.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: brain.color }} />
              <span className="text-[6px] font-bold" style={{ color: brain.color }}>{brain.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side metrics table */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="text-[7px] text-[#3a3a3a] tracking-widest px-3 pt-3 pb-2">METRICS COMPARISON</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[7px] font-mono min-w-[340px]">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left py-1.5 px-3 text-[6px] text-[#3a3a3a] tracking-widest">METRIC</th>
                {activeBrains.map(({ brain }) => (
                  <th key={brain.id} className="py-1.5 px-2 text-[6px] tracking-widest text-center" style={{ color: brain.color }}>
                    {brain.icon} {brain.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, i) => (
                <tr key={metric.key} className="border-b border-[#111]"
                  style={{ background: i % 2 === 0 ? 'transparent' : '#050505' }}>
                  <td className="py-1.5 px-3 text-[6px] text-[#5a5a54] tracking-widest">{metric.label}</td>
                  {activeBrains.map(({ brain, ...s }) => {
                    const val = s[metric.key];
                    const allVals = brainStats.map(b => b[metric.key]);
                    const isBest = val === Math.max(...allVals.filter(v => v !== Infinity));
                    const isWorst = val === Math.min(...allVals);
                    const color = isBest ? '#22c55e' : isWorst ? '#ef4444' : '#9a9a94';
                    return (
                      <td key={brain.id} className="py-1.5 px-2 text-center font-bold" style={{ color }}>
                        {metric.format(val)}
                        {isBest && activeBrains.length > 1 && <span className="text-[5px] ml-0.5">▲</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Written ranking */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
        <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">STRATEGY VERDICT</div>
        <div className="space-y-1.5">
          {brainStats.map(({ brain, winRate, roi, profitFactor }, i) => {
            const grade = roi > 300 ? 'ELITE' : roi > 100 ? 'STRONG' : roi > 0 ? 'POSITIVE' : 'UNDERPERFORMING';
            const gradeColor = grade === 'ELITE' ? '#FFB81C' : grade === 'STRONG' ? '#22c55e' : grade === 'POSITIVE' ? '#3b82f6' : '#ef4444';
            return (
              <div key={brain.id} className="flex items-center gap-2">
                <span className="text-[7px] text-[#444] w-4 text-center">#{i + 1}</span>
                <span className="text-sm">{brain.icon}</span>
                <span className="text-[8px] font-black w-20 flex-shrink-0" style={{ color: brain.color }}>{brain.name}</span>
                <span className="text-[6px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: gradeColor + '18', color: gradeColor, border: `1px solid ${gradeColor}30` }}>
                  {grade}
                </span>
                <span className="text-[7px] text-[#5a5a54] ml-auto">{winRate.toFixed(0)}% WR · {profitFactor.toFixed(2)} PF</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}