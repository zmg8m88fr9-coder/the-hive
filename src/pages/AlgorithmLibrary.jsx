import { useState } from 'react';

const ALGORITHMS = [
  {
    id: 'short_squeeze',
    name: 'Short Squeeze',
    category: 'Setup-Based',
    color: '#ef4444',
    description: 'High short interest + low float + catalyst breakout',
    rules: [
      'Scan for high short interest and low float',
      'Confirm high relative volume',
      'Identify strong catalyst',
      'Enter long on breakout above resistance or first pullback',
      'Stop loss on failed breakout',
      'Take profit into parabolic spikes',
      'Exit immediately if volume dies',
    ],
    bestFor: ['Stocks', 'Low-Float'],
    riskLevel: 'High',
    holdTime: '15m - 2h',
  },
  {
    id: 'vwap_trend_day',
    name: 'VWAP Trend Day',
    category: 'Technical',
    color: '#22c55e',
    description: 'Trade trend days with VWAP as dynamic support/resistance',
    rules: [
      'After open, check if price holds above VWAP',
      'Confirm pullbacks keep making higher lows',
      'Trade long only above VWAP',
      'Add on clean pullbacks to 9 EMA or VWAP',
      'Exit if price closes below VWAP',
      'Avoid shorting strong trend days',
    ],
    bestFor: ['Stocks', 'Intraday'],
    riskLevel: 'Medium',
    holdTime: '30m - 4h',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    category: 'Technical',
    color: '#f59e0b',
    description: 'Ride directional momentum with RSI and MACD confluence',
    rules: [
      'Identify strong directional move (up or down)',
      'Confirm with RSI > 60 (long) or < 40 (short)',
      'MACD histogram increasing in direction of trade',
      'Entry on breakout of 5-min consolidation',
      'Stop loss below swing low (longs) / above swing high (shorts)',
      'Trail stop as momentum increases',
      'Exit on divergence or momentum loss',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '5m - 2h',
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    category: 'Statistical',
    color: '#06b6d4',
    description: 'Trade oversold/overbought extremes back to mean',
    rules: [
      'Identify extreme RSI (< 20 or > 80)',
      'Bollinger Band squeeze breaking',
      'Price reversal signals (hammer, pin bars)',
      'Enter counter-trend at extremes',
      'Target: midline of Bollinger Bands',
      'Stop: beyond recent swing',
      'Avoid trading during strong trends',
    ],
    bestFor: ['Range-Bound Assets'],
    riskLevel: 'Medium-High',
    holdTime: '15m - 2h',
  },
  {
    id: 'gamma_squeeze',
    name: 'Gamma Squeeze',
    category: 'Options',
    color: '#f97316',
    description: 'Exploit gamma acceleration on options chain',
    rules: [
      'Monitor open interest around strike prices',
      'Identify gamma-heavy strikes (lots of OI)',
      'Watch IV for compression signals',
      'Enter on breakout through gamma concentration',
      'Gamma acceleration feeds momentum',
      'Exit into vol spike or failed breakout',
      'Time decay accelerates near expiration',
    ],
    bestFor: ['Underlying with Vol'],
    riskLevel: 'High',
    holdTime: '30m - 4h',
  },
  {
    id: 'carry_trade',
    name: 'Carry Trade',
    category: 'Macro',
    color: '#22c55e',
    description: 'Long higher-yield currency, short lower-yield',
    rules: [
      'Identify interest rate differential',
      'Long higher-yield currency (e.g., AUD, NZD)',
      'Short lower-yield currency (e.g., JPY, CHF)',
      'Confirm trend alignment',
      'Hold for days/weeks collecting carry',
      'Watch for central bank announcements',
      'Exit on policy reversal or trend break',
    ],
    bestFor: ['Forex Pairs'],
    riskLevel: 'Medium',
    holdTime: 'Days to Weeks',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    category: 'Technical',
    color: '#FFB81C',
    description: 'Trade price breaks of key resistance/support levels',
    rules: [
      'Identify consolidation (flag, triangle, rectangle)',
      'Measure breakout target (measured move)',
      'Enter on close above resistance',
      'Volume confirmation (spike on breakout)',
      'Stop loss just below breakout level',
      'Target: measured move or previous highs',
      'Exit if pullback below breakout fails to hold',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '1h - 1 week',
  },
  {
    id: 'stat_arb',
    name: 'Statistical Arbitrage',
    category: 'Pairs',
    color: '#14b8a6',
    description: 'Trade pairs divergence based on statistical correlation',
    rules: [
      'Identify highly correlated pairs (stocks, currencies)',
      'Monitor spread between pair prices',
      'Enter when spread exceeds 2σ historical',
      'Long the underperformer, short the outperformer',
      'Exit when spread mean-reverts or risk increases',
      'Hedge using correlation decay',
      'Use z-score for position sizing',
    ],
    bestFor: ['Correlated Assets'],
    riskLevel: 'Medium',
    holdTime: 'Hours to Days',
  },
];

export default function AlgorithmLibrary() {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', ...new Set(ALGORITHMS.map(a => a.category))];
  const filtered = filterCategory === 'All' ? ALGORITHMS : ALGORITHMS.filter(a => a.category === filterCategory);

  const selected = selectedAlgo ? ALGORITHMS.find(a => a.id === selectedAlgo) : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#FFB81C]">ALGORITHM LIBRARY</h1>
        <div className="text-[8px] text-[#6b6860]">Trading Setup Reference · Rules · Setups · Best Practices</div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-lg border text-[7px] font-bold tracking-widest transition-all"
              style={{
                background: filterCategory === cat ? '#FFB81C15' : 'transparent',
                border: `1px solid ${filterCategory === cat ? '#FFB81C50' : '#1a1a1a'}`,
                color: filterCategory === cat ? '#FFB81C' : '#444',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Algorithm Grid */}
        <div className="grid grid-cols-1 gap-2">
          {filtered.map(algo => {
            const isSelected = selectedAlgo === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => setSelectedAlgo(isSelected ? null : algo.id)}
                className="text-left bg-[#0d0d0d] border rounded-lg p-3 transition-all active:scale-98"
                style={{ borderColor: isSelected ? algo.color + '50' : '#1a1a1a' }}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: algo.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold tracking-widest truncate" style={{ color: algo.color }}>
                      {algo.name}
                    </div>
                    <div className="text-[7px] text-[#6b6860]">{algo.category}</div>
                  </div>
                  <span className="text-[#3a3a3a] text-[8px]">{isSelected ? '▲' : '▼'}</span>
                </div>

                {!isSelected && (
                  <div className="text-[8px] text-[#7a7a74] line-clamp-1">{algo.description}</div>
                )}

                {isSelected && (
                  <div className="pt-2.5 border-t border-[#111] space-y-2.5">
                    {/* Meta */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-[6px] text-[#4a4a44] tracking-widest mb-0.5">RISK</div>
                        <div className="text-[7px] font-bold text-[#d4d0c8]">{algo.riskLevel}</div>
                      </div>
                      <div>
                        <div className="text-[6px] text-[#4a4a44] tracking-widest mb-0.5">HOLD TIME</div>
                        <div className="text-[7px] font-bold text-[#d4d0c8]">{algo.holdTime}</div>
                      </div>
                      <div>
                        <div className="text-[6px] text-[#4a4a44] tracking-widest mb-0.5">BEST FOR</div>
                        <div className="text-[7px] font-bold text-[#d4d0c8]">{algo.bestFor.join(', ')}</div>
                      </div>
                    </div>

                    {/* Rules */}
                    <div>
                      <div className="text-[6px] text-[#4a4a44] tracking-widest mb-1.5">RULES</div>
                      <ol className="space-y-1">
                        {algo.rules.map((rule, i) => (
                          <li key={i} className="flex gap-2 text-[7px] text-[#8a8a84] leading-relaxed">
                            <span className="text-[#3a3a3a] flex-shrink-0">{i + 1}.</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}