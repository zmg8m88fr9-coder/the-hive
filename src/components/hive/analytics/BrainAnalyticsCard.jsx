import { useState } from 'react';

const PLAY_LABELS = {
  momentum: 'MOMENTUM', short_squeeze: 'SHORT SQZ', bull_flag: 'BULL FLAG',
  bear_flag: 'BEAR FLAG', scalp: 'SCALP', breakout: 'BREAKOUT',
  reversal: 'REVERSAL', mean_reversion: 'MEAN REV', gamma_squeeze: 'GAMMA SQZ',
  trend_follow: 'TREND', news_catalyst: 'NEWS', liquidity_sweep: 'LIQ SWEEP',
  vwap_trend_day: 'VWAP TREND', unknown: 'UNKNOWN',
};

const PLAY_COLORS = {
  momentum: '#D4A020', short_squeeze: '#C04438', bull_flag: '#3E9E6B',
  bear_flag: '#C04438', scalp: '#3A74D4', breakout: '#C8892A',
  reversal: '#8A54E0', mean_reversion: '#06b6d4', gamma_squeeze: '#f97316',
  trend_follow: '#3E9E6B', news_catalyst: '#ec4899', liquidity_sweep: '#8b5cf6',
  vwap_trend_day: '#3E9E6B', unknown: '#555',
};

function StatBox({ label, value, color }) {
  return (
    <div className="bg-[#1A1510] rounded p-2 text-center">
      <div className="mono text-[10px] font-black" style={{ color: color ?? '#DDD6C4' }}>{value}</div>
      <div className="text-[6px] text-[#3a3a3a] tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

export default function BrainAnalyticsCard({ stats, rank }) {
  const [expanded, setExpanded] = useState(false);
  const { brain, winRate, roi, totalPnl, avgPnl, avgWin, avgLoss, profitFactor, totalTrades, closedTrades, openTrades, bestPlay, worstPlay, playStats } = stats;
  const color = brain.color;
  const pnlColor = totalPnl >= 0 ? '#3E9E6B' : '#C04438';

  return (
    <div className="bg-[#131009] border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: color + '30' }}>

      {/* Collapsed Row */}
      <button className="w-full text-left p-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2.5">
          {/* Rank */}
          <div className="text-[8px] font-black w-4 text-center" style={{ color: rank === 1 ? '#C8892A' : '#333' }}>
            #{rank}
          </div>

          {/* Brain Icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            {brain.icon}
          </div>

          {/* Name + focus */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black tracking-widest" style={{ color }}>{brain.name}</span>
              <span className="text-[6px] text-[#444] border border-[#2B2216] px-1 py-0.5 rounded">{brain.focus}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[7px] text-[#5a5a54]">{totalTrades} trades</span>
              <span className="text-[7px] text-[#3a3a3a]">·</span>
              <span className="text-[7px]" style={{ color: winRate >= 55 ? '#3E9E6B' : winRate >= 45 ? '#C8892A' : '#C04438' }}>
                {winRate.toFixed(0)}% win
              </span>
            </div>
          </div>

          {/* ROI + P&L */}
          <div className="text-right flex-shrink-0">
            <div className="mono text-sm font-black" style={{ color: roi >= 0 ? '#3E9E6B' : '#C04438' }}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </div>
            <div className="mono text-[7px]" style={{ color: pnlColor }}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </div>
          </div>

          <span className="text-[#3a3a3a] text-[9px] ml-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[#111] px-3 pb-4 pt-3 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            <StatBox label="WIN RATE" value={`${winRate.toFixed(1)}%`}
              color={winRate >= 55 ? '#3E9E6B' : winRate >= 45 ? '#C8892A' : '#C04438'} />
            <StatBox label="AVG P&L" value={`${avgPnl >= 0 ? '+' : ''}$${avgPnl.toFixed(2)}`}
              color={avgPnl >= 0 ? '#3E9E6B' : '#C04438'} />
            <StatBox label="PROFIT FACTOR" value={profitFactor > 0 ? profitFactor.toFixed(2) : '—'}
              color={profitFactor >= 2 ? '#3E9E6B' : profitFactor >= 1 ? '#C8892A' : '#C04438'} />
            <StatBox label="OPEN" value={openTrades} color={color} />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <StatBox label="AVG WIN" value={avgWin > 0 ? `+$${avgWin.toFixed(2)}` : '—'} color="#3E9E6B" />
            <StatBox label="AVG LOSS" value={avgLoss < 0 ? `$${avgLoss.toFixed(2)}` : '—'} color="#C04438" />
            <StatBox label="CLOSED" value={closedTrades} color="#DDD6C4" />
            <StatBox label="BALANCE" value={`$${brain.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color={color} />
          </div>

          {/* Win Rate Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[6px] text-[#3a3a3a] tracking-widest">WIN / LOSS SPLIT</span>
              <span className="text-[7px] text-[#5a5a54]">{stats.wonTrades}W · {stats.lostTrades}L</span>
            </div>
            <div className="h-1.5 bg-[#2B2216] rounded-full overflow-hidden flex">
              <div className="h-full bg-[#3E9E6B] rounded-l-full transition-all"
                style={{ width: `${winRate}%` }} />
              <div className="h-full bg-[#C04438] flex-1 rounded-r-full" />
            </div>
          </div>

          {/* Best / Worst Play */}
          {(bestPlay || worstPlay) && (
            <div className="grid grid-cols-2 gap-2">
              {bestPlay && (
                <div className="bg-[#1A1510] rounded p-2">
                  <div className="text-[6px] text-[#3E9E6B] tracking-widest mb-1">BEST PLAY TYPE</div>
                  <div className="text-[8px] font-bold" style={{ color: PLAY_COLORS[bestPlay.name] ?? '#DDD6C4' }}>
                    {PLAY_LABELS[bestPlay.name] ?? bestPlay.name}
                  </div>
                  <div className="text-[7px] text-[#3E9E6B] mt-0.5">+${bestPlay.totalPnl.toFixed(2)}</div>
                  <div className="text-[6px] text-[#444]">{bestPlay.count} trades · {((bestPlay.wins / bestPlay.count) * 100).toFixed(0)}% win</div>
                </div>
              )}
              {worstPlay && worstPlay.name !== bestPlay?.name && (
                <div className="bg-[#1A1510] rounded p-2">
                  <div className="text-[6px] text-[#C04438] tracking-widest mb-1">WORST PLAY TYPE</div>
                  <div className="text-[8px] font-bold" style={{ color: PLAY_COLORS[worstPlay.name] ?? '#DDD6C4' }}>
                    {PLAY_LABELS[worstPlay.name] ?? worstPlay.name}
                  </div>
                  <div className="text-[7px] text-[#C04438] mt-0.5">${worstPlay.totalPnl.toFixed(2)}</div>
                  <div className="text-[6px] text-[#444]">{worstPlay.count} trades · {((worstPlay.wins / worstPlay.count) * 100).toFixed(0)}% win</div>
                </div>
              )}
            </div>
          )}

          {/* Play Type Mini Breakdown */}
          {Object.keys(playStats).length > 0 && (
            <div>
              <div className="text-[6px] text-[#3a3a3a] tracking-widest mb-1.5">P&L BY PLAY TYPE</div>
              <div className="space-y-1">
                {Object.entries(playStats)
                  .sort((a, b) => b[1].totalPnl - a[1].totalPnl)
                  .map(([pt, data]) => {
                    const ptColor = PLAY_COLORS[pt] ?? '#555';
                    const ptWinRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
                    return (
                      <div key={pt} className="flex items-center gap-2">
                        <div className="text-[7px] font-bold w-20 flex-shrink-0 truncate" style={{ color: ptColor }}>
                          {PLAY_LABELS[pt] ?? pt}
                        </div>
                        <div className="flex-1 h-1 bg-[#1A1510] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${ptWinRate}%`,
                            background: ptWinRate >= 55 ? '#3E9E6B' : ptWinRate >= 45 ? '#C8892A' : '#C04438',
                          }} />
                        </div>
                        <div className="text-[7px] font-bold w-14 text-right flex-shrink-0"
                          style={{ color: data.totalPnl >= 0 ? '#3E9E6B' : '#C04438' }}>
                          {data.totalPnl >= 0 ? '+' : ''}${data.totalPnl.toFixed(0)}
                        </div>
                        <div className="text-[6px] text-[#444] w-6 text-right flex-shrink-0">{data.count}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}