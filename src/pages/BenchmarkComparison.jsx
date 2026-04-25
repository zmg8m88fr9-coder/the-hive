import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Simulated benchmark performance data (90 days)
function generateBenchmarkData() {
  const data = [];
  let sp500 = 100;
  let btc = 100;
  
  for (let i = 0; i < 90; i++) {
    sp500 = sp500 * (1 + (Math.random() - 0.48) * 0.01); // ~2% monthly drift
    btc = btc * (1 + (Math.random() - 0.45) * 0.02); // Higher volatility
    
    data.push({
      day: i,
      sp500: parseFloat(sp500.toFixed(2)),
      btc: parseFloat(btc.toFixed(2)),
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1510] border border-[#3A2E1F] rounded px-2 py-1.5 text-[7px] font-mono">
      <div className="text-[#8A7F6D]">Day {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function BenchmarkComparison() {
  const [benchmark, setBenchmark] = useState('sp500'); // sp500 | btc
  const [selectedBrains, setSelectedBrains] = useState(new Set(BRAINS.map(b => b.id)));

  const benchmarkData = useMemo(() => generateBenchmarkData(), []);

  const { data: trades = [] } = useQuery({
    queryKey: ['trades-benchmark'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 200),
  });

  // Calculate performance metrics
  const brainMetrics = useMemo(() => {
    const benchStart = benchmark === 'sp500' ? benchmarkData[0].sp500 : benchmarkData[0].btc;
    const benchEnd = benchmark === 'sp500' ? benchmarkData[benchmarkData.length - 1].sp500 : benchmarkData[benchmarkData.length - 1].btc;
    const benchReturn = ((benchEnd - benchStart) / benchStart) * 100;

    return BRAINS.map(brain => {
      const brainTrades = trades.filter(t => t.brain_id === brain.id);
      const closedTrades = brainTrades.filter(t => t.status === 'closed' && t.pnl != null);
      
      if (closedTrades.length === 0) {
        return {
          brain,
          totalReturn: 0,
          alpha: -benchReturn,
          beatsBenchmark: false,
          tradeCount: 0,
        };
      }

      const totalPnL = closedTrades.reduce((s, t) => s + t.pnl, 0);
      const totalReturn = (totalPnL / 3000) * 100; // Normalized to 3K starting balance
      const alpha = totalReturn - benchReturn;

      return {
        brain,
        totalReturn,
        benchmarkReturn: benchReturn,
        alpha,
        beatsBenchmark: totalReturn > benchReturn,
        tradeCount: closedTrades.length,
      };
    });
  }, [trades, benchmark, benchmarkData]);

  const activeBrains = brainMetrics.filter(m => selectedBrains.has(m.brain.id));
  const sortedByAlpha = [...brainMetrics].sort((a, b) => b.alpha - a.alpha);

  const toggleBrain = (id) => {
    setSelectedBrains(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const benchmarkLabel = benchmark === 'sp500' ? 'S&P 500' : 'Bitcoin';

  // Generate comparative performance data
  const perfData = benchmarkData.map((point, i) => {
    const obj = { day: point.day };
    obj[benchmarkLabel] = benchmark === 'sp500' ? point.sp500 : point.btc;
    
    activeBrains.forEach(metric => {
      const dayProgress = (i / benchmarkData.length);
      const brainStart = 100;
      const totalExpectedGain = (metric.totalReturn / 100) * 100;
      obj[metric.brain.name] = brainStart + (totalExpectedGain * dayProgress);
    });
    
    return obj;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#C8892A]">ALPHA ANALYSIS</h1>
        <div className="text-[8px] text-[#8A7F6D]">Brain Performance vs Market Benchmarks · Excess Returns</div>

        {/* Benchmark selector */}
        <div className="flex gap-1.5 mt-3">
          {[
            { id: 'sp500', label: 'S&P 500', color: '#3A74D4' },
            { id: 'btc', label: 'Bitcoin', color: '#D4A020' },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setBenchmark(b.id)}
              className="px-3 py-1.5 rounded text-[7px] font-bold tracking-widest transition-all"
              style={{
                background: benchmark === b.id ? b.color + '20' : 'transparent',
                border: `1px solid ${benchmark === b.id ? b.color + '50' : '#2B2216'}`,
                color: benchmark === b.id ? b.color : '#444',
              }}
            >
              vs {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Brain toggles */}
        <div className="flex gap-1.5 flex-wrap">
          {BRAINS.map(b => {
            const on = selectedBrains.has(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBrain(b.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                style={{
                  background: on ? b.color + '20' : '#131009',
                  border: `1px solid ${on ? b.color + '60' : '#2B2216'}`,
                  color: on ? b.color : '#333',
                }}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>

        {/* Performance Chart */}
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
          <div className="text-[7px] text-[#4D4538] tracking-widest mb-2">CUMULATIVE PERFORMANCE (90D)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={perfData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#2B2216" />
              <XAxis dataKey="day" tick={{ fill: '#333', fontSize: 8 }} />
              <YAxis tick={{ fill: '#333', fontSize: 8 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '7px', paddingTop: '10px' }} />
              
              {/* Benchmark */}
              <Line
                type="monotone"
                dataKey={benchmarkLabel}
                stroke={benchmark === 'sp500' ? '#3A74D4' : '#D4A020'}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              
              {/* Brain lines */}
              {activeBrains.map(metric => (
                <Line
                  key={metric.brain.id}
                  type="monotone"
                  dataKey={metric.brain.name}
                  stroke={metric.brain.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alpha Ranking */}
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
          <div className="text-[7px] text-[#4D4538] tracking-widest mb-3">ALPHA RANKING (vs {benchmarkLabel})</div>
          
          {/* Alpha bar chart */}
          <div className="mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sortedByAlpha} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#2B2216" />
                <XAxis dataKey="brain.name" tick={{ fill: '#333', fontSize: 6 }} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#333', fontSize: 8 }} label={{ value: 'Alpha %', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ background: '#1A1510', border: '1px solid #3A2E1F', borderRadius: 4, fontSize: 7 }}
                  formatter={(value) => `${value.toFixed(2)}%`}
                />
                <Bar dataKey="alpha" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {sortedByAlpha.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.alpha > 0 ? '#3E9E6B' : '#C04438'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metric table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[7px] font-mono">
              <thead>
                <tr className="border-b border-[#2B2216]">
                  {['RANK', 'BRAIN', 'RETURN', benchmarkLabel.toUpperCase(), 'ALPHA', 'BEATS?', 'TRADES'].map(h => (
                    <th key={h} className="text-left py-1.5 px-2 text-[6px] text-[#4D4538] tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedByAlpha.map((metric, i) => (
                  <tr key={metric.brain.id} className="border-b border-[#111]" style={{ background: i % 2 === 0 ? 'transparent' : '#050505' }}>
                    <td className="py-1.5 px-2 text-[#444]">#{i + 1}</td>
                    <td className="py-1.5 px-2">
                      <span style={{ color: metric.brain.color }} className="font-bold">{metric.brain.name}</span>
                    </td>
                    <td className="py-1.5 px-2" style={{ color: metric.totalReturn >= 0 ? '#3E9E6B' : '#C04438' }}>
                      {metric.totalReturn >= 0 ? '+' : ''}{metric.totalReturn.toFixed(2)}%
                    </td>
                    <td className="py-1.5 px-2 text-[#8A7F6D]">
                      {metric.benchmarkReturn >= 0 ? '+' : ''}{metric.benchmarkReturn.toFixed(2)}%
                    </td>
                    <td className="py-1.5 px-2 font-bold" style={{ color: metric.alpha > 0 ? '#3E9E6B' : '#C04438' }}>
                      {metric.alpha > 0 ? '+' : ''}{metric.alpha.toFixed(2)}%
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1 py-0.5 rounded text-[6px] font-bold ${metric.beatsBenchmark ? 'bg-[#3E9E6B20] text-[#3E9E6B]' : 'bg-[#C0443820] text-[#C04438]'}`}>
                        {metric.beatsBenchmark ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-[#8A7F6D]">{metric.tradeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3 space-y-2">
          <div className="text-[7px] text-[#4D4538] tracking-widest">ALPHA INSIGHTS</div>
          {sortedByAlpha.slice(0, 3).map((metric, i) => {
            const label = i === 0 ? 'TOP ALPHA' : i === 1 ? '2ND' : '3RD';
            return (
              <div key={metric.brain.id} className="flex items-center gap-2 px-2 py-1.5 bg-[#1A1510] rounded border border-[#2B2216]">
                <span className="text-[8px] font-bold w-10" style={{ color: metric.brain.color }}>{label}</span>
                <span className="text-[8px]" style={{ color: metric.brain.color }}>{metric.brain.icon} {metric.brain.name}</span>
                <span className="ml-auto text-[8px] font-bold" style={{ color: metric.alpha > 0 ? '#3E9E6B' : '#C04438' }}>
                  {metric.alpha > 0 ? '+' : ''}{metric.alpha.toFixed(2)}% alpha
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}