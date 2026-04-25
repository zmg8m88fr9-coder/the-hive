import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

const RL_METHODS = {
  'DDQN': { label: 'DDQN', color: '#FFB81C', desc: 'Double DQN — Value-Based, Low-Float Squeezes' },
  'DDQN+LSTM': { label: 'DDQN+LSTM', color: '#ef4444', desc: 'Sequence-Based, Crypto Trading' },
  'GRPO': { label: 'GRPO', color: '#a855f7', desc: 'Group Relative Policy, Options IV' },
  'LLM+DDQN': { label: 'LLM+DDQN', color: '#22c55e', desc: 'LLM-Guided, Macro Forex' },
  'PPO+TvrReg': { label: 'PPO+TvrReg', color: '#3b82f6', desc: 'Policy Gradient, Futures Trading' },
  'A2C': { label: 'A2C', color: '#f59e0b', desc: 'Actor-Critic, ETF Sector Rotation' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1.5 text-[7px]">
      <div className="text-[#6b6860]">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AlgorithmDashboard() {
  const [selectedAlgo, setSelectedAlgo] = useState(null);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades-algorithms'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 500),
  });

  // Group trades by RL method and compute metrics
  const algorithmStats = useMemo(() => {
    const stats = {};

    // Initialize all algorithms
    Object.keys(RL_METHODS).forEach(key => {
      stats[key] = {
        trades: [],
        closedTrades: [],
        totalPnl: 0,
        wonTrades: 0,
        lostTrades: 0,
        winRate: 0,
        avgPnl: 0,
        sharpeDaily: [],
        pnlHistory: [],
        brains: [],
      };
    });

    // Get the RL method for each brain
    const brainRlMap = {};
    BRAINS.forEach(brain => {
      brainRlMap[brain.id] = brain.rlMethod;
    });

    // Group trades by RL method
    trades.forEach(trade => {
      const rlMethod = brainRlMap[trade.brain_id];
      if (rlMethod && stats[rlMethod]) {
        stats[rlMethod].trades.push(trade);
        if (trade.status === 'closed' && trade.pnl != null) {
          stats[rlMethod].closedTrades.push(trade);
          stats[rlMethod].totalPnl += trade.pnl;
          if (trade.pnl > 0) stats[rlMethod].wonTrades++;
          else stats[rlMethod].lostTrades++;
        }
      }
    });

    // Calculate metrics for each algorithm
    Object.keys(stats).forEach(key => {
      const s = stats[key];
      if (s.closedTrades.length > 0) {
        s.winRate = (s.wonTrades / s.closedTrades.length) * 100;
        s.avgPnl = s.totalPnl / s.closedTrades.length;
      }

      // Cumulative P&L history (for line chart)
      let cumPnl = 0;
      s.pnlHistory = s.closedTrades
        .filter(t => t.closed_at)
        .sort((a, b) => new Date(a.closed_at) - new Date(b.closed_at))
        .map(t => {
          const d = new Date(t.closed_at);
          return {
            date: isNaN(d.getTime()) ? '—' : format(d, 'MMM d'),
            pnl: (cumPnl += t.pnl),
            trade: t.ticker,
          };
        });

      // Daily Sharpe ratio approximation (rolling 30-day)
      const dailyReturns = {};
      s.closedTrades.filter(t => t.closed_at).forEach(t => {
        const d = new Date(t.closed_at);
        if (isNaN(d.getTime())) return;
        const date = format(d, 'yyyy-MM-dd');
        if (!dailyReturns[date]) dailyReturns[date] = [];
        dailyReturns[date].push(t.pnl);
      });

      const sharpeData = [];
      Object.entries(dailyReturns).forEach(([date, returns]) => {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const std = Math.sqrt(variance);
        const sd = new Date(date);
        sharpeData.push({
          date: isNaN(sd.getTime()) ? '—' : format(sd, 'MMM d'),
          sharpe: std > 0 ? mean / std : 0,
        });
      });
      s.sharpeDaily = sharpeData;

      // Get unique brains using this algorithm
      s.brains = BRAINS.filter(b => b.rlMethod === key);
    });

    return stats;
  }, [trades]);

  const algoList = Object.entries(algorithmStats)
    .filter(([_, stats]) => stats.trades.length > 0)
    .sort((a, b) => b[1].totalPnl - a[1].totalPnl);

  const activeAlgo = selectedAlgo || (algoList.length > 0 ? algoList[0][0] : null);
  const activeStats = activeAlgo ? algorithmStats[activeAlgo] : null;
  const algoInfo = activeAlgo ? RL_METHODS[activeAlgo] : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#FFB81C]">ALGORITHM PERFORMANCE</h1>
        <div className="text-[8px] text-[#6b6860]">RL Method Analysis · Cumulative P&L · Sharpe Ratios · Win Rates</div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {isLoading && (
          <div className="text-center py-12 text-[#6b6860] text-[10px] tracking-widest">COMPUTING METRICS...</div>
        )}

        {!isLoading && algoList.length === 0 && (
          <div className="text-center py-12 text-[#333] text-[9px] tracking-widest">NO TRADE DATA</div>
        )}

        {!isLoading && algoList.length > 0 && (
          <>
            {/* Algorithm Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {algoList.map(([key, stats]) => {
                const info = RL_METHODS[key];
                const isActive = activeAlgo === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedAlgo(key)}
                    className="flex-shrink-0 px-3 py-2 rounded-lg border transition-all text-[7px] font-bold tracking-widest"
                    style={{
                      background: isActive ? info.color + '15' : 'transparent',
                      border: `1px solid ${isActive ? info.color + '50' : '#1a1a1a'}`,
                      color: isActive ? info.color : '#444',
                    }}
                  >
                    <div>{info.label}</div>
                    <div className="text-[6px] text-[#666]">${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(0)}</div>
                  </button>
                );
              })}
            </div>

            {activeStats && algoInfo && (
              <>
                {/* Algorithm Info */}
                <div className="bg-[#0d0d0d] border rounded-xl p-3.5" style={{ borderColor: algoInfo.color + '30' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{ background: algoInfo.color + '18', border: `1px solid ${algoInfo.color}35` }}>
                      ◈
                    </div>
                    <div>
                      <div className="text-[9px] font-black tracking-widest" style={{ color: algoInfo.color }}>
                        {algoInfo.label}
                      </div>
                      <div className="text-[7px] text-[#6b6860]">{algoInfo.desc}</div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-5 gap-1.5 pt-2 border-t" style={{ borderColor: algoInfo.color + '12' }}>
                    <div className="bg-[#111] rounded p-2 text-center">
                      <div className="text-[10px] font-black mono">${activeStats.totalPnl.toFixed(0)}</div>
                      <div className="text-[6px] text-[#4a4a44]">TOTAL P&L</div>
                    </div>
                    <div className="bg-[#111] rounded p-2 text-center">
                      <div className="text-[10px] font-black mono" style={{ color: activeStats.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                        {activeStats.winRate.toFixed(1)}%
                      </div>
                      <div className="text-[6px] text-[#4a4a44]">WIN RATE</div>
                    </div>
                    <div className="bg-[#111] rounded p-2 text-center">
                      <div className="text-[10px] font-black mono" style={{ color: algoInfo.color }}>
                        {activeStats.closedTrades.length}
                      </div>
                      <div className="text-[6px] text-[#4a4a44]">TRADES</div>
                    </div>
                    <div className="bg-[#111] rounded p-2 text-center">
                      <div className="text-[10px] font-black mono" style={{ color: activeStats.avgPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        ${activeStats.avgPnl.toFixed(2)}
                      </div>
                      <div className="text-[6px] text-[#4a4a44]">AVG P&L</div>
                    </div>
                    <div className="bg-[#111] rounded p-2 text-center">
                      <div className="text-[10px] font-black mono" style={{ color: algoInfo.color }}>
                        {activeStats.brains.length}
                      </div>
                      <div className="text-[6px] text-[#4a4a44]">BRAINS</div>
                    </div>
                  </div>
                </div>

                {/* Cumulative P&L Chart */}
                {activeStats.pnlHistory.length > 0 && (
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
                    <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">CUMULATIVE P&L</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={activeStats.pnlHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#1a1a1a" />
                        <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="pnl" stroke={algoInfo.color} strokeWidth={2} isAnimationActive={false} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Sharpe Ratio Trend */}
                {activeStats.sharpeDaily.length > 0 && (
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
                    <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">SHARPE RATIO TREND</div>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={activeStats.sharpeDaily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#1a1a1a" />
                        <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="sharpe" stroke={algoInfo.color} strokeWidth={2} isAnimationActive={false} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Brains Using This Algorithm */}
                {activeStats.brains.length > 0 && (
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
                    <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">BRAINS USING {algoInfo.label}</div>
                    <div className="space-y-1.5">
                      {activeStats.brains.map(brain => {
                        const brainTrades = activeStats.closedTrades.filter(t => t.brain_id === brain.id);
                        const brainPnl = brainTrades.reduce((s, t) => s + t.pnl, 0);
                        const brainWinRate = brainTrades.length > 0
                          ? (brainTrades.filter(t => t.pnl > 0).length / brainTrades.length) * 100
                          : 0;
                        return (
                          <div key={brain.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111] rounded">
                            <span className="text-lg flex-shrink-0">{brain.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[8px] font-bold tracking-widest" style={{ color: brain.color }}>
                                {brain.name}
                              </div>
                              <div className="text-[6px] text-[#4a4a44]">{brain.focus}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[7px] font-bold" style={{ color: brainPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                                {brainPnl >= 0 ? '+' : ''}${brainPnl.toFixed(0)}
                              </div>
                              <div className="text-[6px] text-[#4a4a44]">{brainWinRate.toFixed(0)}% WR</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}