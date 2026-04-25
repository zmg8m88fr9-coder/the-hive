import { useState, useMemo } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { BRAINS } from '../../lib/hiveData';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';

// Seeded pseudo-random for stable chart data per trade
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateTradeChart(trade) {
  const seed = trade.id?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) ?? 42;
  const rand = seededRand(seed);
  const points = 30;
  const entry = trade.entry_price ?? 100;
  const exit = trade.exit_price ?? entry * (1 + (rand() - 0.5) * 0.05);
  const data = [];
  let price = entry;
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = entry + (exit - entry) * t;
    const noise = (rand() - 0.5) * entry * 0.015;
    price = trend + noise;
    // MACD simulation
    const macd = (rand() - 0.5) * 2;
    const signal = macd * 0.8 + (rand() - 0.5) * 0.3;
    // RSI
    const rsi = 30 + rand() * 40 + (t * 20 * (trade.action === 'BUY' ? 1 : -1));
    // Stochastic
    const stoch = Math.min(95, Math.max(5, 50 + (rand() - 0.5) * 60));
    data.push({
      i,
      price: parseFloat(price.toFixed(4)),
      macd: parseFloat(macd.toFixed(3)),
      signal: parseFloat(signal.toFixed(3)),
      rsi: parseFloat(Math.min(100, Math.max(0, rsi)).toFixed(1)),
      stoch: parseFloat(stoch.toFixed(1)),
    });
  }
  return data;
}

const MiniTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1510] border border-[#3A2E1F] rounded px-2 py-1 text-[7px] font-mono">
      <div className="text-[#DDD6C4]">${payload[0]?.value?.toFixed(4)}</div>
    </div>
  );
};

export default function TradeCard({ trade }) {
  const [expanded, setExpanded] = useState(false);
  const brain = BRAINS.find(b => b.id === trade.brain_id);
  const color = brain?.color ?? '#C8892A';
  const isBuy = trade.action === 'BUY';
  const isOpen = trade.status === 'open';
  const pnlPositive = (trade.pnl ?? 0) >= 0;
  const pnlColor = pnlPositive ? '#3E9E6B' : '#C04438';

  const chartData = useMemo(() => generateTradeChart(trade), [trade.id]);

  const holdMinutes = trade.opened_at && trade.closed_at
    ? differenceInMinutes(new Date(trade.closed_at + 'Z'), new Date(trade.opened_at + 'Z'))
    : null;

  const holdLabel = holdMinutes != null
    ? holdMinutes >= 60 ? `${(holdMinutes / 60).toFixed(1)}h` : `${holdMinutes}m`
    : 'OPEN';

  const PLAY_LABELS = {
    momentum: 'MOMENTUM', short_squeeze: 'SHORT SQUEEZE', bull_flag: 'BULL FLAG',
    bear_flag: 'BEAR FLAG', scalp: 'SCALP', breakout: 'BREAKOUT',
    reversal: 'REVERSAL', mean_reversion: 'MEAN REVERT', gamma_squeeze: 'GAMMA SQZ',
    trend_follow: 'TREND FOLLOW', news_catalyst: 'NEWS', liquidity_sweep: 'LIQ SWEEP',
  };
  const PLAY_COLORS = {
    momentum: '#D4A020', short_squeeze: '#C04438', bull_flag: '#3E9E6B',
    bear_flag: '#C04438', scalp: '#3A74D4', breakout: '#C8892A',
    reversal: '#8A54E0', mean_reversion: '#06b6d4', gamma_squeeze: '#f97316',
    trend_follow: '#3E9E6B', news_catalyst: '#ec4899', liquidity_sweep: '#8b5cf6',
  };
  const playLabel = trade.play_type ? PLAY_LABELS[trade.play_type] : null;
  const playColor = trade.play_type ? PLAY_COLORS[trade.play_type] : null;

  const lastRsi = chartData[chartData.length - 1]?.rsi;
  const lastStoch = chartData[chartData.length - 1]?.stoch;
  const lastMacd = chartData[chartData.length - 1]?.macd;
  const lastSignal = chartData[chartData.length - 1]?.signal;

  return (
    <div className="bg-[#131009] border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: isOpen ? color + '40' : '#2B2216' }}>

      {/* Collapsed Row — always visible */}
      <button className="w-full text-left p-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            {brain?.icon ?? '◎'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="mono font-black text-sm text-[#DDD6C4]">{trade.ticker}</span>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#3E9E6B20] text-[#3E9E6B]' : 'bg-[#C0443820] text-[#C04438]'}`}>
                {isBuy ? '▲ BUY' : '▼ SHORT'}
              </span>
              {playLabel && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: playColor + '18', color: playColor, border: `1px solid ${playColor}35` }}>
                  {playLabel}
                </span>
              )}
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ml-auto ${isOpen ? 'bg-[#3E9E6B15] text-[#3E9E6B]' : trade.status === 'cancelled' ? 'bg-[#C0443815] text-[#C04438]' : 'bg-[#C8892A15] text-[#C8892A]'}`}>
                {trade.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[7px] text-[#8A7F6D]">
                <span className="text-[#4D4538]">IN </span>
                <span className="font-mono text-[#9a9a94]">${trade.entry_price?.toFixed(4)}</span>
              </span>
              {trade.exit_price != null && (
                <span className="text-[7px] text-[#8A7F6D]">
                  <span className="text-[#4D4538]">OUT </span>
                  <span className="font-mono text-[#9a9a94]">${trade.exit_price?.toFixed(4)}</span>
                </span>
              )}
              {trade.pnl != null && (
                <span className="text-[8px] font-bold mono ml-auto" style={{ color: pnlColor }}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  <span className="text-[7px] ml-1 opacity-80">({trade.pnl_pct >= 0 ? '+' : ''}{trade.pnl_pct?.toFixed(2)}%)</span>
                </span>
              )}
            </div>
          </div>
          <span className="text-[#4D4538] text-[9px] ml-1 flex-shrink-0">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[#111] px-3 pb-4 space-y-3 pt-3">

          {/* Price Chart */}
          <div>
            <div className="text-[7px] text-[#4D4538] tracking-widest mb-1">PRICE ACTION</div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={chartData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${trade.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={pnlColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={pnlColor} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke={pnlColor} strokeWidth={1.5}
                  fill={`url(#grad-${trade.id})`} dot={false} />
                <ReferenceLine y={trade.entry_price} stroke={color} strokeDasharray="3 4" strokeOpacity={0.5} />
                {trade.exit_price && <ReferenceLine y={trade.exit_price} stroke="#666" strokeDasharray="3 4" strokeOpacity={0.4} />}
                <XAxis hide />
                <YAxis tick={{ fill: '#333', fontSize: 6, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `$${v.toFixed(0)}`} />
                <Tooltip content={<MiniTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trade Meta Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'ENTRY PRICE', value: `$${trade.entry_price?.toFixed(4)}`, color: '#DDD6C4' },
              { label: 'EXIT PRICE', value: trade.exit_price != null ? `$${trade.exit_price?.toFixed(4)}` : '—', color: '#DDD6C4' },
              { label: 'P&L', value: trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—', color: trade.pnl != null ? pnlColor : '#555' },
              { label: 'RETURN %', value: trade.pnl_pct != null ? `${trade.pnl_pct >= 0 ? '+' : ''}${trade.pnl_pct?.toFixed(2)}%` : '—', color: trade.pnl_pct != null ? pnlColor : '#555' },
              { label: 'QTY', value: trade.quantity ?? '—', color: '#DDD6C4' },
              { label: 'HOLD TIME', value: holdLabel, color: color },
              { label: 'OPENED', value: trade.opened_at ? format(new Date(trade.opened_at + 'Z'), 'MMM d, HH:mm') : '—', color: '#7a7a74' },
              { label: 'CLOSED', value: trade.closed_at ? format(new Date(trade.closed_at + 'Z'), 'MMM d, HH:mm') : '—', color: '#7a7a74' },
              { label: 'PLAY TYPE', value: playLabel ?? '—', color: playColor ?? '#555' },
            ].map(s => (
              <div key={s.label} className="bg-[#1A1510] rounded p-2">
                <div className="text-[6px] text-[#4D4538] tracking-widest mb-0.5">{s.label}</div>
                <div className="mono text-[9px] font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div>
            <div className="text-[7px] text-[#4D4538] tracking-widest mb-2">INDICATORS AT CLOSE</div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* RSI */}
              <div className="bg-[#1A1510] rounded p-2">
                <div className="text-[6px] text-[#4D4538] mb-1">RSI (14)</div>
                <div className="mono text-[10px] font-black" style={{ color: lastRsi > 70 ? '#C04438' : lastRsi < 30 ? '#3E9E6B' : '#DDD6C4' }}>
                  {lastRsi?.toFixed(1)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastRsi > 70 ? '#C04438' : lastRsi < 30 ? '#3E9E6B' : '#555' }}>
                  {lastRsi > 70 ? 'OVERBOUGHT' : lastRsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                </div>
                <div className="h-1 bg-[#2B2216] rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lastRsi}%`, background: lastRsi > 70 ? '#C04438' : lastRsi < 30 ? '#3E9E6B' : '#C8892A' }} />
                </div>
              </div>

              {/* Stochastic */}
              <div className="bg-[#1A1510] rounded p-2">
                <div className="text-[6px] text-[#4D4538] mb-1">STOCH (14)</div>
                <div className="mono text-[10px] font-black" style={{ color: lastStoch > 80 ? '#C04438' : lastStoch < 20 ? '#3E9E6B' : '#DDD6C4' }}>
                  {lastStoch?.toFixed(1)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastStoch > 80 ? '#C04438' : lastStoch < 20 ? '#3E9E6B' : '#555' }}>
                  {lastStoch > 80 ? 'OVERBOUGHT' : lastStoch < 20 ? 'OVERSOLD' : 'NEUTRAL'}
                </div>
                <div className="h-1 bg-[#2B2216] rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lastStoch}%`, background: lastStoch > 80 ? '#C04438' : lastStoch < 20 ? '#3E9E6B' : '#8A54E0' }} />
                </div>
              </div>

              {/* MACD */}
              <div className="bg-[#1A1510] rounded p-2">
                <div className="text-[6px] text-[#4D4538] mb-1">MACD</div>
                <div className="mono text-[10px] font-black" style={{ color: lastMacd > lastSignal ? '#3E9E6B' : '#C04438' }}>
                  {lastMacd?.toFixed(3)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastMacd > lastSignal ? '#3E9E6B' : '#C04438' }}>
                  {lastMacd > lastSignal ? 'BULLISH' : 'BEARISH'}
                </div>
                <div className="text-[6px] text-[#3A2E1F] mt-0.5">SIG {lastSignal?.toFixed(3)}</div>
              </div>
            </div>
          </div>

          {/* MACD Chart */}
          <div>
            <div className="text-[7px] text-[#4D4538] tracking-widest mb-1">MACD HISTOGRAM</div>
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={chartData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                <ReferenceLine y={0} stroke="#222" />
                <Line type="monotone" dataKey="macd" stroke="#3E9E6B" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="signal" stroke="#C04438" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <XAxis hide />
                <YAxis tick={{ fill: '#333', fontSize: 6 }} tickFormatter={v => v.toFixed(1)} />
                <Tooltip contentStyle={{ display: 'none' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RSI Chart */}
          <div>
            <div className="text-[7px] text-[#4D4538] tracking-widest mb-1">RSI</div>
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={chartData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                <ReferenceLine y={70} stroke="#C0443840" strokeDasharray="3 4" />
                <ReferenceLine y={30} stroke="#3E9E6B40" strokeDasharray="3 4" />
                <Line type="monotone" dataKey="rsi" stroke="#8A54E0" strokeWidth={1.5} dot={false} />
                <XAxis hide />
                <YAxis domain={[0, 100]} tick={{ fill: '#333', fontSize: 6 }} />
                <Tooltip contentStyle={{ display: 'none' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reasoning */}
          {trade.reasoning && (
            <div className="bg-[#1A1510] rounded p-2.5">
              <div className="text-[6px] text-[#4D4538] tracking-widest mb-1">BRAIN REASONING</div>
              <div className="text-[8px] text-[#8A7F6D] leading-relaxed">{trade.reasoning}</div>
            </div>
          )}

          {/* Brain badge */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
              style={{ background: color + '15', border: `1px solid ${color}30` }}>
              {brain?.icon}
            </div>
            <span className="text-[8px] font-bold" style={{ color }}>{brain?.name}</span>
            <span className="text-[7px] text-[#4D4538]">{brain?.focus} · {brain?.sin}</span>
          </div>
        </div>
      )}
    </div>
  );
}