import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#131009] border border-[#2a2a2a] rounded-lg px-2.5 py-2 text-[8px]">
      <div className="text-[#8A7F6D] mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[#DDD6C4] ml-auto font-mono">{p.value?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SharpeChart({ history, brains }) {
  const data = useMemo(() => {
    if (!brains.length) return [];
    const days = history[brains[0].id] ?? [];
    return days.map((d, i) => {
      const point = { date: d.date };
      brains.forEach(b => {
        point[b.id] = history[b.id]?.[i]?.sharpe ?? 0;
      });
      return point;
    });
  }, [history, brains]);

  const tickFormatter = (val, idx) => (idx % 15 === 0 ? val : '');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[9px] font-bold tracking-widest text-[#8A54E0]">ROLLING SHARPE (30D) — 90 DAYS</div>
        <div className="text-[7px] text-[#3a3a3a]">≥1 = good · ≥2 = excellent</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#151515" />
          <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 7, fontFamily: 'JetBrains Mono' }}
            tickFormatter={tickFormatter} interval={0} />
          <YAxis tick={{ fill: '#444', fontSize: 7, fontFamily: 'JetBrains Mono' }}
            tickFormatter={v => v.toFixed(1)} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#2a2a2a" strokeDasharray="4 4" />
          <ReferenceLine y={1} stroke="#3E9E6B" strokeDasharray="3 6" strokeOpacity={0.3} label={{ value: '1.0', fill: '#3E9E6B', fontSize: 6, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine y={2} stroke="#C8892A" strokeDasharray="3 6" strokeOpacity={0.3} label={{ value: '2.0', fill: '#C8892A', fontSize: 6, fontFamily: 'JetBrains Mono' }} />
          {brains.map(b => (
            <Line key={b.id} type="monotone" dataKey={b.id} name={b.name}
              stroke={b.color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: b.color }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}