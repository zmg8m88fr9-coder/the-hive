import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';

export default function BrainHeatmap() {
  const [tick, setTick] = useState(0);

  const { data: trades = [] } = useQuery({
    queryKey: ['trades-heatmap'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 200),
  });

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics for each brain
  const brainMetrics = useMemo(() => {
    return BRAINS.map(brain => {
      const brainTrades = trades.filter(t => t.brain_id === brain.id);
      const closedTrades = brainTrades.filter(t => t.status === 'closed' && t.pnl != null);
      
      // Win rate
      const wonTrades = closedTrades.filter(t => t.pnl > 0).length;
      const winRate = closedTrades.length > 0 ? (wonTrades / closedTrades.length) * 100 : 50;
      
      // Volatility (std dev of P&L)
      if (closedTrades.length < 2) {
        return { brain, winRate, volatility: 0, heat: 50 };
      }
      
      const avgPnL = closedTrades.reduce((s, t) => s + t.pnl, 0) / closedTrades.length;
      const variance = closedTrades.reduce((s, t) => s + Math.pow(t.pnl - avgPnL, 2), 0) / closedTrades.length;
      const volatility = Math.sqrt(variance);
      
      // Heat score: (win_rate * 0.6 + (100 - volatility*2) * 0.4) normalized to 0-100
      const stabilityScore = Math.max(0, 100 - volatility * 2);
      const heat = winRate * 0.6 + stabilityScore * 0.4;
      
      return { brain, winRate, volatility, heat };
    });
  }, [trades, tick]);

  // Sort by heat
  const sortedBrains = [...brainMetrics].sort((a, b) => b.heat - a.heat);
  const maxHeat = Math.max(...brainMetrics.map(m => m.heat), 1);
  const minHeat = Math.min(...brainMetrics.map(m => m.heat), 0);
  const heatRange = maxHeat - minHeat || 1;

  const getHeatColor = (heat) => {
    const normalized = (heat - minHeat) / heatRange;
    if (normalized > 0.7) return { bg: '#3E9E6B', text: '#0B0905', label: 'HOT' };
    if (normalized > 0.5) return { bg: '#C8892A', text: '#0B0905', label: 'WARM' };
    if (normalized > 0.3) return { bg: '#D4A020', text: '#0B0905', label: 'TEPID' };
    return { bg: '#C04438', text: '#fff', label: 'COLD' };
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#C8892A]">BRAIN HEATMAP</h1>
        <div className="text-[8px] text-[#8A7F6D]">Win-rate vs Volatility · Real-time Heat Ranking</div>
      </div>

      <div className="px-4 pt-6 pb-6 space-y-6">
        {/* Legend */}
        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { color: '#3E9E6B', label: 'HOT', desc: 'High win-rate, low volatility' },
            { color: '#C8892A', label: 'WARM', desc: 'Balanced performance' },
            { color: '#D4A020', label: 'TEPID', desc: 'Moderate metrics' },
            { color: '#C04438', label: 'COLD', desc: 'Low performance' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <div className="text-[7px] text-[#8A7F6D]">
                <span className="font-bold text-[#DDD6C4]">{item.label}</span> {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Main Heatmap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sortedBrains.map((metric, rank) => {
            const { bg, text, label } = getHeatColor(metric.heat);
            const tradeCount = trades.filter(t => t.brain_id === metric.brain.id && t.status === 'closed').length;
            
            return (
              <button
                key={metric.brain.id}
                className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-105 active:scale-95"
                style={{ background: bg, border: `2px solid ${bg}50` }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-20 blur-xl" style={{ background: bg }} />
                
                {/* Rank badge */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black"
                  style={{ background: text === '#0B0905' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)', color: text }}>
                  #{rank + 1}
                </div>

                <div className="relative z-10 space-y-3">
                  {/* Brain identity */}
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{metric.brain.icon}</span>
                    <div>
                      <div className="text-sm font-black tracking-widest" style={{ color: text }}>{metric.brain.name}</div>
                      <div className="text-[7px] opacity-70" style={{ color: text }}>{metric.brain.focus}</div>
                    </div>
                  </div>

                  {/* Heat label */}
                  <div className="text-[10px] font-black tracking-widest" style={{ color: text }}>
                    {label}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] opacity-80" style={{ color: text }}>WIN RATE</span>
                      <span className="text-[9px] font-bold" style={{ color: text }}>{metric.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: text === '#0B0905' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ 
                        width: `${metric.winRate}%`, 
                        background: text === '#0B0905' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' 
                      }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] opacity-80" style={{ color: text }}>VOLATILITY</span>
                      <span className="text-[9px] font-bold" style={{ color: text }}>{metric.volatility.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: text === '#0B0905' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ 
                        width: `${Math.min(metric.volatility / 50 * 100, 100)}%`, 
                        background: text === '#0B0905' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' 
                      }} />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: text === '#0B0905' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] opacity-80" style={{ color: text }}>HEAT SCORE</span>
                      <span className="text-[11px] font-black" style={{ color: text }}>{metric.heat.toFixed(0)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: text === '#0B0905' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ 
                        width: `${(metric.heat / 100) * 100}%`, 
                        background: text === '#0B0905' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' 
                      }} />
                    </div>
                  </div>

                  {/* Trade count */}
                  <div className="text-[7px] opacity-70 text-center pt-1" style={{ color: text }}>
                    {tradeCount} closed trades
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend explanation */}
        <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-4 text-[8px] text-[#8A7F6D] space-y-2">
          <div className="font-bold text-[#DDD6C4]">How it works:</div>
          <div>• <span className="text-[#DDD6C4]">Heat Score = Win Rate (60%) + Stability (40%)</span></div>
          <div>• <span className="text-[#DDD6C4]">Higher win-rate = better performance</span></div>
          <div>• <span className="text-[#DDD6C4]">Lower volatility = more consistent, less risky</span></div>
          <div>• <span className="text-[#DDD6C4]">HOT brains are currently performing best overall</span></div>
        </div>
      </div>
    </div>
  );
}