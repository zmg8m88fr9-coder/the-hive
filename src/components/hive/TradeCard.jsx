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
    <div className="bg-[#111] border border-[#2a2a2a] rounded px-2 py-1 text-[7px] font-mono">
      <div className="text-[#d4d0c8]">${payload[0]?.value?.toFixed(4)}</div>
    </div>
  );
};

export default function TradeCard({ trade }) {
  const [expanded, setExpanded] = useState(false);
  const brain = BRAINS.find(b => b.id === trade.brain_id);
  const color = brain?.color ?? '#FFB81C';
  const isBuy = trade.action === 'BUY';
  const isOpen = trade.status === 'open';
  const pnlPositive = (trade.pnl ?? 0) >= 0;
  const pnlColor = pnlPositive ? '#22c55e' : '#ef4444';

  const chartData = useMemo(() => generateTradeChart(trade), [trade.id]);

  const holdMinutes = trade.opened_at && trade.closed_at
    ? differenceInMinutes(new Date(trade.closed_at), new Date(trade.opened_at))
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
    momentum: '#f59e0b', short_squeeze: '#ef4444', bull_flag: '#22c55e',
    bear_flag: '#ef4444', scalp: '#3b82f6', breakout: '#FFB81C',
    reversal: '#a855f7', mean_reversion: '#06b6d4', gamma_squeeze: '#f97316',
    trend_follow: '#22c55e', news_catalyst: '#ec4899', liquidity_sweep: '#8b5cf6',
  };
  const playLabel = trade.play_type ? PLAY_LABELS[trade.play_type] : null;
  const playColor = trade.play_type ? PLAY_COLORS[trade.play_type] : null;

  const lastRsi = chartData[chartData.length - 1]?.rsi;
  const lastStoch = chartData[chartData.length - 1]?.stoch;
  const lastMacd = chartData[chartData.length - 1]?.macd;
  const lastSignal = chartData[chartData.length - 1]?.signal;

  return (
    <div className="bg-[#0d0d0d] border rounded-xl overflow-hidden transition-all"
      style={{ borderColor: isOpen ? color + '40' : '#1a1a1a' }}>

      {/* Collapsed Row — always visible */}
      <button className="w-full text-left p-3" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            {brain?.icon ?? '◎'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="mono font-black text-sm text-[#d4d0c8]">{trade.ticker}</span>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${isBuy ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#ef444420] text-[#ef4444]'}`}>
                {isBuy ? '▲ BUY' : '▼ SHORT'}
              </span>
              {playLabel && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: playColor + '18', color: playColor, border: `1px solid ${playColor}35` }}>
                  {playLabel}
                </span>
              )}
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ml-auto ${isOpen ? 'bg-[#22c55e15] text-[#22c55e]' : trade.status === 'cancelled' ? 'bg-[#ef444415] text-[#ef4444]' : 'bg-[#FFB81C15] text-[#FFB81C]'}`}>
                {trade.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[7px] text-[#5a5a54]">
                <span className="text-[#4a4a44]">IN </span>
                <span className="font-mono text-[#9a9a94]">${trade.entry_price?.toFixed(4)}</span>
              </span>
              {trade.exit_price != null && (
                <span className="text-[7px] text-[#5a5a54]">
                  <span className="text-[#4a4a44]">OUT </span>
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
          <span className="text-[#3a3a3a] text-[9px] ml-1 flex-shrink-0">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[#111] px-3 pb-4 space-y-3 pt-3">

          {/* Price Chart */}
          <div>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-1">PRICE ACTION</div>
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
              { label: 'ENTRY PRICE', value: `$${trade.entry_price?.toFixed(4)}`, color: '#d4d0c8' },
              { label: 'EXIT PRICE', value: trade.exit_price != null ? `$${trade.exit_price?.toFixed(4)}` : '—', color: '#d4d0c8' },
              { label: 'P&L', value: trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—', color: trade.pnl != null ? pnlColor : '#555' },
              { label: 'RETURN %', value: trade.pnl_pct != null ? `${trade.pnl_pct >= 0 ? '+' : ''}${trade.pnl_pct?.toFixed(2)}%` : '—', color: trade.pnl_pct != null ? pnlColor : '#555' },
              { label: 'QTY', value: trade.quantity ?? '—', color: '#d4d0c8' },
              { label: 'HOLD TIME', value: holdLabel, color: color },
              { label: 'OPENED', value: trade.opened_at ? format(new Date(trade.opened_at), 'MMM d, HH:mm') : '—', color: '#7a7a74' },
              { label: 'CLOSED', value: trade.closed_at ? format(new Date(trade.closed_at), 'MMM d, HH:mm') : '—', color: '#7a7a74' },
              { label: 'PLAY TYPE', value: playLabel ?? '—', color: playColor ?? '#555' },
            ].map(s => (
              <div key={s.label} className="bg-[#111] rounded p-2">
                <div className="text-[6px] text-[#3a3a3a] tracking-widest mb-0.5">{s.label}</div>
                <div className="mono text-[9px] font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">INDICATORS AT CLOSE</div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* RSI */}
              <div className="bg-[#111] rounded p-2">
                <div className="text-[6px] text-[#3a3a3a] mb-1">RSI (14)</div>
                <div className="mono text-[10px] font-black" style={{ color: lastRsi > 70 ? '#ef4444' : lastRsi < 30 ? '#22c55e' : '#d4d0c8' }}>
                  {lastRsi?.toFixed(1)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastRsi > 70 ? '#ef4444' : lastRsi < 30 ? '#22c55e' : '#555' }}>
                  {lastRsi > 70 ? 'OVERBOUGHT' : lastRsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lastRsi}%`, background: lastRsi > 70 ? '#ef4444' : lastRsi < 30 ? '#22c55e' : '#FFB81C' }} />
                </div>
              </div>

              {/* Stochastic */}
              <div className="bg-[#111] rounded p-2">
                <div className="text-[6px] text-[#3a3a3a] mb-1">STOCH (14)</div>
                <div className="mono text-[10px] font-black" style={{ color: lastStoch > 80 ? '#ef4444' : lastStoch < 20 ? '#22c55e' : '#d4d0c8' }}>
                  {lastStoch?.toFixed(1)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastStoch > 80 ? '#ef4444' : lastStoch < 20 ? '#22c55e' : '#555' }}>
                  {lastStoch > 80 ? 'OVERBOUGHT' : lastStoch < 20 ? 'OVERSOLD' : 'NEUTRAL'}
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lastStoch}%`, background: lastStoch > 80 ? '#ef4444' : lastStoch < 20 ? '#22c55e' : '#a855f7' }} />
                </div>
              </div>

              {/* MACD */}
              <div className="bg-[#111] rounded p-2">
                <div className="text-[6px] text-[#3a3a3a] mb-1">MACD</div>
                <div className="mono text-[10px] font-black" style={{ color: lastMacd > lastSignal ? '#22c55e' : '#ef4444' }}>
                  {lastMacd?.toFixed(3)}
                </div>
                <div className="text-[6px] mt-0.5" style={{ color: lastMacd > lastSignal ? '#22c55e' : '#ef4444' }}>
                  {lastMacd > lastSignal ? 'BULLISH' : 'BEARISH'}
                </div>
                <div className="text-[6px] text-[#2a2a2a] mt-0.5">SIG {lastSignal?.toFixed(3)}</div>
              </div>
            </div>
          </div>

          {/* MACD Chart */}
          <div>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-1">MACD HISTOGRAM</div>
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={chartData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                <ReferenceLine y={0} stroke="#222" />
                <Line type="monotone" dataKey="macd" stroke="#22c55e" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <XAxis hide />
                <YAxis tick={{ fill: '#333', fontSize: 6 }} tickFormatter={v => v.toFixed(1)} />
                <Tooltip contentStyle={{ display: 'none' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RSI Chart */}
          <div>
            <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-1">RSI</div>
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={chartData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                <ReferenceLine y={70} stroke="#ef444440" strokeDasharray="3 4" />
                <ReferenceLine y={30} stroke="#22c55e40" strokeDasharray="3 4" />
                <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                <XAxis hide />
                <YAxis domain={[0, 100]} tick={{ fill: '#333', fontSize: 6 }} />
                <Tooltip contentStyle={{ display: 'none' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reasoning */}
          {trade.reasoning && (
            <div className="bg-[#111] rounded p-2.5">
              <div className="text-[6px] text-[#3a3a3a] tracking-widest mb-1">BRAIN REASONING</div>
              <div className="text-[8px] text-[#6a6a64] leading-relaxed">{trade.reasoning}</div>
            </div>
          )}

          {/* Brain badge */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
              style={{ background: color + '15', border: `1px solid ${color}30` }}>
              {brain?.icon}
            </div>
            <span className="text-[8px] font-bold" style={{ color }}>{brain?.name}</span>
            <span className="text-[7px] text-[#3a3a3a]">{brain?.focus} · {brain?.sin}</span>
          </div>
        </div>
      )}
    </div>
  );
}