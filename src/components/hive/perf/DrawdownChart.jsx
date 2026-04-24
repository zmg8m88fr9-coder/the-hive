import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg px-2.5 py-2 text-[8px]">
      <div className="text-[#6b6860] mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[#ef4444] ml-auto font-mono">-{Math.abs(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default function DrawdownChart({ history, brains }) {
  const data = useMemo(() => {
    if (!brains.length) return [];
    const days = history[brains[0].id] ?? [];
    return days.map((d, i) => {
      const point = { date: d.date };
      brains.forEach(b => {
        point[b.id] = -(history[b.id]?.[i]?.drawdown ?? 0);
      });
      return point;
    });
  }, [history, brains]);

  const tickFormatter = (val, idx) => (idx % 15 === 0 ? val : '');

  return (
    <div>
      <div className="text-[9px] font-bold tracking-widest text-[#ef4444] mb-3">DRAWDOWN FROM PEAK — 90 DAYS</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {brains.map(b => (
              <linearGradient key={b.id} id={`dd-${b.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={b.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={b.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#151515" />
          <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 7, fontFamily: 'JetBrains Mono' }}
            tickFormatter={tickFormatter} interval={0} />
          <YAxis tick={{ fill: '#444', fontSize: 7, fontFamily: 'JetBrains Mono' }}
            tickFormatter={v => `${v.toFixed(0)}%`} />
          <Tooltip content={<CustomTooltip />} />
          {brains.map(b => (
            <Area key={b.id} type="monotone" dataKey={b.id} name={b.name}
              stroke={b.color} strokeWidth={1.5} fill={`url(#dd-${b.id})`}
              dot={false} activeDot={{ r: 3, fill: b.color }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}