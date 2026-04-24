import { format } from 'date-fns';
import { BRAINS } from '../../lib/hiveData';

const PLAY_LABELS = {
  momentum: 'MOMENTUM', short_squeeze: 'SHORT SQZ', bull_flag: 'BULL FLAG',
  bear_flag: 'BEAR FLAG', scalp: 'SCALP', breakout: 'BREAKOUT',
  reversal: 'REVERSAL', mean_reversion: 'MEAN REV', gamma_squeeze: 'GAMMA SQZ',
  trend_follow: 'TREND', news_catalyst: 'NEWS', liquidity_sweep: 'LIQ SWEEP',
};

const PLAY_COLORS = {
  momentum: '#f59e0b', short_squeeze: '#ef4444', bull_flag: '#22c55e',
  bear_flag: '#ef4444', scalp: '#3b82f6', breakout: '#FFB81C',
  reversal: '#a855f7', mean_reversion: '#06b6d4', gamma_squeeze: '#f97316',
  trend_follow: '#22c55e', news_catalyst: '#ec4899', liquidity_sweep: '#8b5cf6',
};

function fmt(date) {
  if (!date) return '—';
  try { return format(new Date(date), 'MMM d, HH:mm'); } catch { return '—'; }
}

function duration(opened, closed) {
  if (!opened || !closed) return '—';
  const mins = Math.round((new Date(closed) - new Date(opened)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${(mins / 60).toFixed(1)}h`;
}

export default function TradeTable({ trades }) {
  if (!trades.length) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl opacity-20 mb-2">◎</div>
        <div className="text-[9px] text-[#333] tracking-widest">NO TRADES</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[8px] font-mono min-w-[700px]">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {['BRAIN', 'ASSET', 'DIR', 'PLAY', 'ENTRY $', 'EXIT $', 'QTY', 'P&L $', 'P&L %', 'OPENED', 'CLOSED', 'HOLD', 'STATUS'].map(h => (
              <th key={h} className="text-left py-2 px-2 text-[7px] text-[#3a3a3a] tracking-widest font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => {
            const brain = BRAINS.find(b => b.id === trade.brain_id);
            const color = brain?.color ?? '#FFB81C';
            const isBuy = trade.action === 'BUY';
            const isOpen = trade.status === 'open';
            const pnlColor = trade.pnl == null ? '#555' : trade.pnl >= 0 ? '#22c55e' : '#ef4444';
            const playColor = trade.play_type ? PLAY_COLORS[trade.play_type] : '#555';

            return (
              <tr
                key={trade.id}
                className="border-b border-[#111] hover:bg-[#0d0d0d] transition-colors"
                style={{ background: i % 2 === 0 ? 'transparent' : '#050505' }}
              >
                {/* Brain */}
                <td className="py-2 px-2 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{brain?.icon ?? '◎'}</span>
                    <span className="font-black text-[7px] tracking-widest" style={{ color }}>{brain?.name ?? trade.brain_id}</span>
                  </div>
                </td>

                {/* Asset */}
                <td className="py-2 px-2 whitespace-nowrap">
                  <span className="font-black text-[9px] text-[#d4d0c8]">{trade.ticker}</span>
                </td>

                {/* Direction */}
                <td className="py-2 px-2 whitespace-nowrap">
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[7px] ${isBuy ? 'bg-[#22c55e15] text-[#22c55e]' : 'bg-[#ef444415] text-[#ef4444]'}`}>
                    {isBuy ? '▲ BUY' : '▼ SHORT'}
                  </span>
                </td>

                {/* Play type */}
                <td className="py-2 px-2 whitespace-nowrap">
                  {trade.play_type ? (
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-bold"
                      style={{ background: playColor + '18', color: playColor, border: `1px solid ${playColor}30` }}>
                      {PLAY_LABELS[trade.play_type]}
                    </span>
                  ) : <span className="text-[#2a2a2a]">—</span>}
                </td>

                {/* Entry */}
                <td className="py-2 px-2 whitespace-nowrap text-[#9a9a94]">
                  ${trade.entry_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 }) ?? '—'}
                </td>

                {/* Exit */}
                <td className="py-2 px-2 whitespace-nowrap text-[#9a9a94]">
                  {trade.exit_price != null
                    ? `$${trade.exit_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`
                    : <span className="text-[#3a3a3a]">OPEN</span>}
                </td>

                {/* Qty */}
                <td className="py-2 px-2 whitespace-nowrap text-[#7a7a74]">
                  {trade.quantity ?? '—'}
                </td>

                {/* P&L $ */}
                <td className="py-2 px-2 whitespace-nowrap font-black" style={{ color: pnlColor }}>
                  {trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                </td>

                {/* P&L % */}
                <td className="py-2 px-2 whitespace-nowrap font-black" style={{ color: pnlColor }}>
                  {trade.pnl_pct != null ? `${trade.pnl_pct >= 0 ? '+' : ''}${trade.pnl_pct.toFixed(2)}%` : '—'}
                </td>

                {/* Opened */}
                <td className="py-2 px-2 whitespace-nowrap text-[#5a5a54]">{fmt(trade.opened_at)}</td>

                {/* Closed */}
                <td className="py-2 px-2 whitespace-nowrap text-[#5a5a54]">{fmt(trade.closed_at)}</td>

                {/* Hold */}
                <td className="py-2 px-2 whitespace-nowrap text-[#5a5a54]">
                  {isOpen ? <span className="text-[#22c55e]">LIVE</span> : duration(trade.opened_at, trade.closed_at)}
                </td>

                {/* Status */}
                <td className="py-2 px-2 whitespace-nowrap">
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${
                    isOpen ? 'bg-[#22c55e15] text-[#22c55e]'
                    : trade.status === 'cancelled' ? 'bg-[#ef444415] text-[#ef4444]'
                    : 'bg-[#FFB81C15] text-[#FFB81C]'
                  }`}>
                    {trade.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}