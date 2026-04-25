import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';
import BrainAnalyticsCard from '../components/hive/analytics/BrainAnalyticsCard';
import PlayTypeBreakdown from '../components/hive/analytics/PlayTypeBreakdown';
import StrategyComparison from '../components/hive/analytics/StrategyComparison';

const SORT_OPTIONS = [
  { id: 'roi', label: 'ROI %' },
  { id: 'win_rate', label: 'WIN RATE' },
  { id: 'total_pnl', label: 'TOTAL P&L' },
  { id: 'trades', label: 'TRADE COUNT' },
];

export default function BrainAnalytics() {
  const [sortBy, setSortBy] = useState('roi');
  const [activeTab, setActiveTab] = useState('overview'); // overview | plays | compare

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades-analytics'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 500),
  });

  // Compute per-brain stats from real trade data
  const brainStats = useMemo(() => {
    return BRAINS.map(brain => {
      const brainTrades = trades.filter(t => t.brain_id === brain.id);
      const closedTrades = brainTrades.filter(t => t.status === 'closed' && t.pnl != null);
      const openTrades = brainTrades.filter(t => t.status === 'open');
      const wonTrades = closedTrades.filter(t => t.pnl > 0);
      const lostTrades = closedTrades.filter(t => t.pnl <= 0);

      const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
      const winRate = closedTrades.length > 0 ? (wonTrades.length / closedTrades.length) * 100 : 0;
      const avgPnl = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;
      const avgWin = wonTrades.length > 0 ? wonTrades.reduce((s, t) => s + t.pnl, 0) / wonTrades.length : 0;
      const avgLoss = lostTrades.length > 0 ? lostTrades.reduce((s, t) => s + t.pnl, 0) / lostTrades.length : 0;
      const roi = brain.startingBalance > 0 ? ((brain.balance - brain.startingBalance) / brain.startingBalance) * 100 : 0;
      const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? 99 : 0;

      // Play type breakdown
      const playStats = {};
      closedTrades.forEach(t => {
        const pt = t.play_type || 'unknown';
        if (!playStats[pt]) playStats[pt] = { count: 0, wins: 0, totalPnl: 0 };
        playStats[pt].count++;
        if (t.pnl > 0) playStats[pt].wins++;
        playStats[pt].totalPnl += t.pnl;
      });

      // Best / worst play type
      const playEntries = Object.entries(playStats);
      const bestPlay = playEntries.sort((a, b) => b[1].totalPnl - a[1].totalPnl)[0];
      const worstPlay = playEntries.sort((a, b) => a[1].totalPnl - b[1].totalPnl)[0];

      return {
        brain,
        totalTrades: brainTrades.length,
        closedTrades: closedTrades.length,
        openTrades: openTrades.length,
        wonTrades: wonTrades.length,
        lostTrades: lostTrades.length,
        totalPnl,
        winRate,
        avgPnl,
        avgWin,
        avgLoss,
        roi,
        profitFactor,
        playStats,
        bestPlay: bestPlay ? { name: bestPlay[0], ...bestPlay[1] } : null,
        worstPlay: worstPlay ? { name: worstPlay[0], ...worstPlay[1] } : null,
        balance: brain.balance,
      };
    }).sort((a, b) => {
      if (sortBy === 'roi') return b.roi - a.roi;
      if (sortBy === 'win_rate') return b.winRate - a.winRate;
      if (sortBy === 'total_pnl') return b.totalPnl - a.totalPnl;
      if (sortBy === 'trades') return b.totalTrades - a.totalTrades;
      return 0;
    });
  }, [trades, sortBy]);

  // Aggregate play type data across all brains
  const allPlayStats = useMemo(() => {
    const agg = {};
    trades.filter(t => t.status === 'closed' && t.pnl != null).forEach(t => {
      const pt = t.play_type || 'unknown';
      if (!agg[pt]) agg[pt] = { count: 0, wins: 0, totalPnl: 0 };
      agg[pt].count++;
      if (t.pnl > 0) agg[pt].wins++;
      agg[pt].totalPnl += t.pnl;
    });
    return agg;
  }, [trades]);

  const totalHivePnl = brainStats.reduce((s, b) => s + b.totalPnl, 0);
  const bestBrain = brainStats[0];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#C8892A]">BRAIN ANALYTICS</h1>
            <div className="text-[8px] text-[#8A7F6D]">Win rates · P&L per strategy · ROI · Best plays</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E9E6B] animate-pulse" />
            <span className="text-[8px] text-[#3E9E6B]">LIVE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'plays', label: 'PLAY TYPES' },
            { id: 'compare', label: 'COMPARE' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-1.5 text-[7px] font-bold tracking-widest rounded transition-all"
              style={{
                background: activeTab === tab.id ? '#C8892A15' : 'transparent',
                color: activeTab === tab.id ? '#C8892A' : '#444',
                border: `1px solid ${activeTab === tab.id ? '#C8892A40' : '#2B2216'}`,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort (overview only) */}
        {activeTab === 'overview' && (
          <div className="flex gap-1">
            {SORT_OPTIONS.map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)}
                className="flex-1 py-1 text-[7px] font-bold tracking-widest rounded transition-all"
                style={{
                  background: sortBy === s.id ? '#C8892A10' : 'transparent',
                  color: sortBy === s.id ? '#C8892A' : '#333',
                  border: `1px solid ${sortBy === s.id ? '#C8892A30' : '#1A1510'}`,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-[#8A7F6D] text-[10px] tracking-widest">COMPUTING ANALYTICS...</div>
        )}

        {!isLoading && (
          <>
            {/* Hive Summary Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3 col-span-2">
                <div className="text-[7px] text-[#4D4538] tracking-widest mb-0.5">HIVE REALIZED P&L</div>
                <div className="mono text-xl font-black" style={{ color: totalHivePnl >= 0 ? '#3E9E6B' : '#C04438' }}>
                  {totalHivePnl >= 0 ? '+' : ''}${totalHivePnl.toFixed(2)}
                </div>
                <div className="text-[7px] text-[#4D4538] mt-0.5">from {trades.filter(t => t.status === 'closed').length} closed trades</div>
              </div>
              <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
                <div className="text-[7px] text-[#4D4538] tracking-widest mb-0.5">TOP BRAIN</div>
                {bestBrain && (
                  <>
                    <div className="text-base">{bestBrain.brain.icon}</div>
                    <div className="mono text-[8px] font-black mt-0.5" style={{ color: bestBrain.brain.color }}>
                      {bestBrain.brain.name}
                    </div>
                    <div className="mono text-[7px] text-[#3E9E6B]">+{bestBrain.roi.toFixed(1)}% ROI</div>
                  </>
                )}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-2">
                {brainStats.map((stats, i) => (
                  <BrainAnalyticsCard key={stats.brain.id} stats={stats} rank={i + 1} />
                ))}
              </div>
            )}

            {activeTab === 'plays' && (
              <PlayTypeBreakdown allPlayStats={allPlayStats} brainStats={brainStats} />
            )}

            {activeTab === 'compare' && (
              <StrategyComparison brainStats={brainStats} />
            )}
          </>
        )}
      </div>
    </div>
  );
}