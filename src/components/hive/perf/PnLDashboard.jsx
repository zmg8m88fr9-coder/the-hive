import { useState, useMemo } from 'react';
import { BRAINS } from '../../../lib/hiveData';
import { generatePerformanceHistory } from '../../../lib/performanceData';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend
} from 'recharts';

const TIME_PERIODS = [
  { id: '7',  label: '7D'  },
  { id: '30', label: '30D' },
  { id: '60', label: '60D' },
  { id: '90', label: '90D' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1510] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[7px] font-mono space-y-1 shadow-xl">
      <div className="text-[#8A7F6D] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[#DDD6C4] ml-auto font-bold">
            {typeof p.value === 'number' ? (p.value >= 0 ? '+' : '') + p.value.toFixed(2) + '%' : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-[#1A1510] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[7px] font-mono shadow-xl">
      <div className="text-[#8A7F6D] mb-1">{label}</div>
      <div style={{ color: val >= 0 ? '#3E9E6B' : '#C04438' }} className="font-bold">
        {val >= 0 ? '+' : ''}${val.toFixed(2)} P&L
      </div>
    </div>
  );
};

export default function PnLDashboard() {
  const [selectedBrains, setSelectedBrains] = useState(new Set(BRAINS.map(b => b.id)));
  const [period, setPeriod] = useState('30');
  const [chartMode, setChartMode] = useState('roi'); // roi | daily | cumulative

  const history = useMemo(() => generatePerformanceHistory(), []);
  const days = parseInt(period);

  const toggleBrain = (id) => {
    setSelectedBrains(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const activeBrains = BRAINS.filter(b => selectedBrains.has(b.id));

  // Slice history to selected period
  const sliced = useMemo(() => {
    const result = {};
    activeBrains.forEach(b => {
      result[b.id] = (history[b.id] ?? []).slice(-days);
    });
    return result;
  }, [period, selectedBrains, history]);

  // Build multi-line ROI chart data
  const roiData = useMemo(() => {
    const len = sliced[activeBrains[0]?.id]?.length ?? 0;
    return Array.from({ length: len }, (_, i) => {
      const point = { date: sliced[activeBrains[0]?.id]?.[i]?.date ?? '' };
      activeBrains.forEach(b => {
        point[b.name] = sliced[b.id]?.[i]?.roi ?? 0;
      });
      return point;
    });
  }, [sliced, activeBrains]);

  // Build daily P&L bar data (sum across selected brains)
  const dailyData = useMemo(() => {
    const len = sliced[activeBrains[0]?.id]?.length ?? 0;
    return Array.from({ length: len }, (_, i) => {
      const date = sliced[activeBrains[0]?.id]?.[i]?.date ?? '';
      const totalDailyReturn = activeBrains.reduce((sum, b) => {
        const d = sliced[b.id]?.[i];
        return sum + (d ? (d.equity - (sliced[b.id]?.[i - 1]?.equity ?? d.equity)) : 0);
      }, 0);
      return { date, pnl: parseFloat(totalDailyReturn.toFixed(2)) };
    });
  }, [sliced, activeBrains]);

  // Summary stats
  const summaryStats = useMemo(() => {
    return activeBrains.map(b => {
      const data = sliced[b.id] ?? [];
      const first = data[0]?.roi ?? 0;
      const last = data[data.length - 1]?.roi ?? 0;
      const periodReturn = last - first;
      const maxDD = Math.max(...data.map(d => d.drawdown));
      const wins = data.filter(d => d.dailyReturn > 0).length;
      return { brain: b, periodReturn, maxDD, winDays: wins, totalDays: data.length };
    });
  }, [sliced, activeBrains]);

  const totalPeriodPnl = summaryStats.reduce((s, st) => {
    const brain = st.brain;
    const data = sliced[brain.id] ?? [];
    if (!data.length) return s;
    return s + (data[data.length - 1].equity - data[0].equity);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-2">
        {/* Time Period */}
        <div className="flex gap-1.5">
          {TIME_PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className="flex-1 py-1.5 text-[8px] font-bold tracking-widest rounded transition-all"
              style={{
                background: period === p.id ? '#C8892A15' : 'transparent',
                color: period === p.id ? '#C8892A' : '#444',
                border: `1px solid ${period === p.id ? '#C8892A40' : '#2B2216'}`,
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Brain Toggles */}
        <div className="flex gap-1 flex-wrap">
          {BRAINS.map(b => {
            const on = selectedBrains.has(b.id);
            return (
              <button key={b.id} onClick={() => toggleBrain(b.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                style={{
                  background: on ? b.color + '20' : '#131009',
                  border: `1px solid ${on ? b.color + '60' : '#2B2216'}`,
                  color: on ? b.color : '#333',
                }}>
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top P&L Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3 col-span-2">
          <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-0.5">PERIOD P&L ({period}D)</div>
          <div className="mono text-xl font-black" style={{ color: totalPeriodPnl >= 0 ? '#3E9E6B' : '#C04438' }}>
            {totalPeriodPnl >= 0 ? '+' : ''}${totalPeriodPnl.toFixed(2)}
          </div>
          <div className="text-[7px] text-[#4D4538] mt-0.5">{activeBrains.length} brain{activeBrains.length !== 1 ? 's' : ''} active</div>
        </div>
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
          <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-0.5">WIN DAYS</div>
          <div className="mono text-xl font-black text-[#C8892A]">
            {summaryStats.reduce((s, st) => s + st.winDays, 0)}
          </div>
          <div className="text-[7px] text-[#4D4538] mt-0.5">of {parseInt(period)} days</div>
        </div>
      </div>

      {/* Chart Mode Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'roi', label: 'CUMUL ROI %' },
          { id: 'daily', label: 'DAILY P&L $' },
        ].map(m => (
          <button key={m.id} onClick={() => setChartMode(m.id)}
            className="flex-1 py-1.5 text-[7px] font-bold tracking-widest rounded transition-all"
            style={{
              background: chartMode === m.id ? '#C8892A10' : 'transparent',
              color: chartMode === m.id ? '#C8892A' : '#444',
              border: `1px solid ${chartMode === m.id ? '#C8892A30' : '#2B2216'}`,
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
        {chartMode === 'roi' && (
          <>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">CUMULATIVE ROI % — {period}D</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={roiData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#2B2216" strokeDasharray="3 6" />
                <ReferenceLine y={0} stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }}
                  interval={Math.floor(roiData.length / 4)} />
                <YAxis tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                {activeBrains.map(b => (
                  <Line key={b.id} type="monotone" dataKey={b.name}
                    stroke={b.color} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {chartMode === 'daily' && (
          <>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">DAILY P&L $ — {period}D (ALL SELECTED)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#2B2216" strokeDasharray="3 6" />
                <ReferenceLine y={0} stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }}
                  interval={Math.floor(dailyData.length / 4)} />
                <YAxis tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => `$${v.toFixed(0)}`} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="pnl" radius={[2, 2, 0, 0]}
                  fill="#3E9E6B"
                  label={false}
                  isAnimationActive={false}>
                  {dailyData.map((entry, i) => (
                    <rect key={i} fill={entry.pnl >= 0 ? '#3E9E6B' : '#C04438'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Per-Brain Breakdown */}
      <div>
        <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">BRAIN BREAKDOWN — {period}D</div>
        <div className="space-y-2">
          {summaryStats.map(({ brain, periodReturn, maxDD, winDays, totalDays }) => (
            <div key={brain.id} className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{brain.icon}</span>
                <div className="flex-1">
                  <div className="text-[9px] font-black" style={{ color: brain.color }}>{brain.name}</div>
                  <div className="text-[7px] text-[#4D4538]">{brain.focus} · {brain.sin}</div>
                </div>
                <div className="text-right">
                  <div className="mono text-xs font-black" style={{ color: periodReturn >= 0 ? '#3E9E6B' : '#C04438' }}>
                    {periodReturn >= 0 ? '+' : ''}{periodReturn.toFixed(2)}%
                  </div>
                  <div className="text-[6px] text-[#3a3a3a]">ROI {period}D</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-[#1A1510] rounded p-1.5 text-center">
                  <div className="mono text-[9px] font-bold text-[#3E9E6B]">{winDays}/{totalDays}</div>
                  <div className="text-[6px] text-[#3a3a3a]">WIN DAYS</div>
                </div>
                <div className="bg-[#1A1510] rounded p-1.5 text-center">
                  <div className="mono text-[9px] font-bold text-[#C04438]">{maxDD.toFixed(1)}%</div>
                  <div className="text-[6px] text-[#3a3a3a]">MAX DD</div>
                </div>
                <div className="bg-[#1A1510] rounded p-1.5 text-center">
                  <div className="mono text-[9px] font-bold" style={{ color: brain.color }}>
                    {((winDays / totalDays) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[6px] text-[#3a3a3a]">WIN RATE</div>
                </div>
              </div>
              {/* Mini sparkline bar */}
              <div className="mt-2 h-1 bg-[#1A1510] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, 50 + periodReturn))}%`,
                    background: periodReturn >= 0 ? brain.color : '#C04438',
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}