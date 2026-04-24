import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PLAY_LABELS = {
  momentum: 'MOMENTUM', short_squeeze: 'SHORT SQZ', bull_flag: 'BULL FLAG',
  bear_flag: 'BEAR FLAG', scalp: 'SCALP', breakout: 'BREAKOUT',
  reversal: 'REVERSAL', mean_reversion: 'MEAN REV', gamma_squeeze: 'GAMMA SQZ',
  trend_follow: 'TREND', news_catalyst: 'NEWS', liquidity_sweep: 'LIQ SWEEP',
  vwap_trend_day: 'VWAP TREND', unknown: 'UNKNOWN',
};

const PLAY_COLORS = {
  momentum: '#f59e0b', short_squeeze: '#ef4444', bull_flag: '#22c55e',
  bear_flag: '#ef4444', scalp: '#3b82f6', breakout: '#FFB81C',
  reversal: '#a855f7', mean_reversion: '#06b6d4', gamma_squeeze: '#f97316',
  trend_follow: '#22c55e', news_catalyst: '#ec4899', liquidity_sweep: '#8b5cf6',
  vwap_trend_day: '#22c55e', unknown: '#555',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[7px] font-mono shadow-xl">
      <div className="text-[#6b6860] mb-1">{label}</div>
      <div style={{ color: val >= 0 ? '#22c55e' : '#ef4444' }} className="font-bold">
        {val >= 0 ? '+' : ''}${val.toFixed(2)} P&L
      </div>
    </div>
  );
};

export default function PlayTypeBreakdown({ allPlayStats, brainStats }) {
  const chartData = Object.entries(allPlayStats)
    .map(([name, data]) => ({
      name: PLAY_LABELS[name] ?? name,
      key: name,
      pnl: parseFloat(data.totalPnl.toFixed(2)),
      winRate: data.count > 0 ? parseFloat(((data.wins / data.count) * 100).toFixed(1)) : 0,
      count: data.count,
      wins: data.wins,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl opacity-20 mb-2">◎</div>
        <div className="text-[9px] text-[#333] tracking-widest">NO CLOSED TRADE DATA</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* P&L by play type chart */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
        <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">P&L BY PLAY TYPE (ALL BRAINS)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#333', fontSize: 5, fontFamily: 'JetBrains Mono' }} />
            <YAxis tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.pnl >= 0 ? (PLAY_COLORS[entry.key] ?? '#22c55e') : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Play type table */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="text-[7px] text-[#3a3a3a] tracking-widest px-3 pt-3 pb-2">PLAY TYPE RANKING</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[7px] font-mono">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {['PLAY', 'TRADES', 'WIN RATE', 'TOTAL P&L', 'AVG P&L'].map(h => (
                  <th key={h} className="text-left py-1.5 px-3 text-[6px] text-[#3a3a3a] tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => {
                const ptColor = PLAY_COLORS[row.key] ?? '#555';
                const avgPnl = row.count > 0 ? row.pnl / row.count : 0;
                return (
                  <tr key={row.key} className="border-b border-[#111]"
                    style={{ background: i % 2 === 0 ? 'transparent' : '#050505' }}>
                    <td className="py-2 px-3">
                      <span className="font-bold" style={{ color: ptColor }}>{row.name}</span>
                    </td>
                    <td className="py-2 px-3 text-[#7a7a74]">{row.count}</td>
                    <td className="py-2 px-3">
                      <span className="font-bold" style={{ color: row.winRate >= 55 ? '#22c55e' : row.winRate >= 45 ? '#FFB81C' : '#ef4444' }}>
                        {row.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 font-black"
                      style={{ color: row.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
                      {row.pnl >= 0 ? '+' : ''}${row.pnl.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 font-black"
                      style={{ color: avgPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                      {avgPnl >= 0 ? '+' : ''}${avgPnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best play per brain */}
      <div>
        <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">BEST PLAY TYPE PER BRAIN</div>
        <div className="space-y-1.5">
          {brainStats.map(({ brain, bestPlay }) => (
            <div key={brain.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-3 py-2 flex items-center gap-3">
              <span className="text-sm">{brain.icon}</span>
              <div className="w-20 flex-shrink-0">
                <div className="text-[8px] font-black tracking-widest" style={{ color: brain.color }}>{brain.name}</div>
              </div>
              {bestPlay ? (
                <>
                  <span className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: (PLAY_COLORS[bestPlay.name] ?? '#555') + '18', color: PLAY_COLORS[bestPlay.name] ?? '#555' }}>
                    {PLAY_LABELS[bestPlay.name] ?? bestPlay.name}
                  </span>
                  <span className="text-[7px] text-[#22c55e] font-bold ml-auto">+${bestPlay.totalPnl.toFixed(2)}</span>
                  <span className="text-[6px] text-[#444]">{bestPlay.count} trades</span>
                </>
              ) : (
                <span className="text-[7px] text-[#333] ml-auto">No closed trades</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}