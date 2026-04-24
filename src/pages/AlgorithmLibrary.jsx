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
  {
    id: 'liquidity_sweep',
    name: 'Liquidity Sweep Reversal',
    category: 'Technical',
    color: '#8b5cf6',
    description: 'Trade fast rejection after sweep of extreme liquidity',
    rules: [
      'Identify obvious high or low',
      'Wait for price to break that level briefly',
      'Watch for fast rejection back inside range',
      'If high is swept and price rejects: enter short',
      'If low is swept and price rejects: enter long',
      'Stop loss: beyond sweep wick',
      'Take profit: mid-range, VWAP, or opposite liquidity level',
    ],
    bestFor: ['Stocks', 'Intraday'],
    riskLevel: 'High',
    holdTime: '5m - 1h',
  },
  {
    id: 'rl_agent',
    name: 'RL Trading Agent',
    category: 'Machine Learning',
    color: '#3b82f6',
    description: 'Adaptive agent trained with profit-based reward signal',
    rules: [
      'Define state: price, volume, indicators, position, unrealized P/L',
      'Define actions: buy, sell, hold, reduce, reverse',
      'Define reward: profit - transaction costs - drawdown penalty',
      'Train agent in simulation',
      'Test on unseen market data',
      'Paper trade before live trading',
      'Do not deploy if agent only works on old data',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: 'Variable',
  },
  {
    id: 'ml_direction',
    name: 'ML Direction Model',
    category: 'Machine Learning',
    color: '#0ea5e9',
    description: 'Supervised classification model for price direction prediction',
    rules: [
      'Collect historical data: price, volume, returns, RSI, MACD, VWAP distance',
      'Label each candle: 1 if future return is positive, 0 if negative',
      'Train model: random forest, XGBoost, logistic regression, or neural net',
      'Predict probability of price going up',
      'If probability > 60%: enter long',
      'If probability < 40%: enter short',
      'Use strict walk-forward testing',
      'Include slippage and fees',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium-High',
    holdTime: '1h - 1 day',
  },
  {
    id: 'low_float',
    name: 'Low Float Momentum',
    category: 'Setup-Based',
    color: '#ec4899',
    description: 'Trade low-float stocks with catalyst and high relative volume',
    rules: [
      'Scan for low-float stocks',
      'Require high relative volume',
      'Require strong catalyst or major price move',
      'Enter on breakout above premarket high or opening range high',
      'Stop loss: failed breakout level',
      'Take profit: scale aggressively into spikes',
      'Avoid chasing after parabolic extension',
    ],
    bestFor: ['Stocks', 'Low-Float'],
    riskLevel: 'High',
    holdTime: '15m - 3h',
  },
  {
    id: 'news_catalyst',
    name: 'News Catalyst Momentum',
    category: 'Event-Based',
    color: '#a855f7',
    description: 'Trade momentum from fresh news events with volume confirmation',
    rules: [
      'Scan for fresh news: earnings beat, FDA approval, merger, contract, guidance raise',
      'Confirm price reaction with volume',
      'Enter only if price holds above VWAP',
      'Avoid if move is already overextended',
      'Stop loss: VWAP loss or news-reaction low',
      'Take profit: scale out into volume spikes',
    ],
    bestFor: ['Stocks'],
    riskLevel: 'High',
    holdTime: '30m - 4h',
  },
  {
    id: 'regime_switch',
    name: 'Regime Switching',
    category: 'Macro',
    color: '#06b6d4',
    description: 'Adapt strategy based on ADX trend strength and ATR volatility',
    rules: [
      'Measure market condition: trend strength using ADX, volatility using ATR',
      'Check price location versus VWAP/EMA',
      'If ADX is high: use momentum/breakout strategy',
      'If ADX is low: use mean reversion strategy',
      'If volatility is extreme: reduce position size or avoid trading',
      'Re-check regime every candle or every session',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: 'Variable',
  },
  {
    id: 'multi_indicator',
    name: 'Multi-Indicator Confirmation',
    category: 'Technical',
    color: '#10b981',
    description: 'Enter only when multiple indicators align for confluence',
    rules: [
      'Long setup requires: price above VWAP, 9 EMA above 20 EMA, RSI above 50, volume above average',
      'Enter long only when all conditions agree',
      'Short setup requires: price below VWAP, 9 EMA below 20 EMA, RSI below 50, volume above average',
      'Exit if two or more conditions fail',
      'Stop loss: recent swing level',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Low-Medium',
    holdTime: '1h - 1 day',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Pullback',
    category: 'Technical',
    color: '#f59e0b',
    description: 'Trade pullbacks to Fibonacci retracement zones',
    rules: [
      'Identify strong impulse move',
      'Draw Fibonacci retracement from swing low to swing high',
      'Watch 38.2%, 50%, and 61.8% retracement zones',
      'Enter long if price rejects one of those zones',
      'Stop loss: below 61.8% or below swing low',
      'Take profit: prior high, 1.272 extension, or 1.618 extension',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '1h - 1 day',
  },
  {
    id: 'stochastic',
    name: 'Stochastic Reversal',
    category: 'Technical',
    color: '#6366f1',
    description: 'Trade reversals from overbought/oversold stochastic extremes',
    rules: [
      'Calculate stochastic oscillator',
      'If stochastic falls below 20: asset is oversold',
      'Enter long when %K crosses above %D',
      'If stochastic rises above 80: asset is overbought',
      'Enter short when %K crosses below %D',
      'Stop loss: beyond recent swing point',
      'Avoid during strong trend unless using trend filter',
    ],
    bestFor: ['Range-Bound Assets'],
    riskLevel: 'Medium',
    holdTime: '30m - 2h',
  },
  {
    id: 'macd_momentum',
    name: 'MACD Momentum',
    category: 'Technical',
    color: '#f59e0b',
    description: 'Trade momentum signals from MACD crossovers',
    rules: [
      'Calculate MACD line and signal line',
      'If MACD crosses above signal line: bullish signal',
      'Confirm price is above VWAP or major EMA',
      'Enter long',
      'Exit when MACD crosses back below signal line',
      'Stop loss: below recent swing low',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '1h - 4h',
  },
  {
    id: 'atr_breakout',
    name: 'ATR Breakout',
    category: 'Technical',
    color: '#ef4444',
    description: 'Trade breakouts using ATR-based volatility thresholds',
    rules: [
      'Calculate ATR, usually 14-period',
      'Define breakout threshold: previous_close ± ATR multiplier',
      'If price breaks above upper ATR threshold: enter long',
      'If price breaks below lower ATR threshold: enter short',
      'Stop loss: 1 ATR away',
      'Take profit: 2 ATR or trailing ATR stop',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium-High',
    holdTime: '30m - 2h',
  },
  {
    id: 'order_book',
    name: 'Order Book Imbalance',
    category: 'Microstructure',
    color: '#1e40af',
    description: 'Trade based on bid/ask size imbalance and tape reading',
    rules: [
      'Read bid size and ask size from level 2/order book',
      'Calculate imbalance: bid_size / (bid_size + ask_size)',
      'If imbalance > 0.65: buyers are stronger, look for long',
      'If imbalance < 0.35: sellers are stronger, look for short',
      'Confirm with tape/sales',
      'Exit quickly if imbalance flips',
    ],
    bestFor: ['Stocks', 'High-Liquid'],
    riskLevel: 'High',
    holdTime: '1m - 15m',
  },
  {
    id: 'pairs_trade',
    name: 'Pairs Trading',
    category: 'Pairs',
    color: '#14b8a6',
    description: 'Trade correlation mean reversion between two assets',
    rules: [
      'Choose two historically correlated assets',
      'Calculate spread between Asset A and Asset B',
      'Calculate z-score of spread',
      'If z-score > +2: short outperformer, long underperformer',
      'If z-score < -2: long underperformer, short outperformer',
      'Exit when z-score returns near 0',
      'Stop loss if z-score keeps expanding',
    ],
    bestFor: ['Correlated Assets'],
    riskLevel: 'Medium',
    holdTime: 'Hours to Days',
  },
  {
    id: 'gap_fade',
    name: 'Gap Fade',
    category: 'Intraday',
    color: '#d946ef',
    description: 'Trade failed gap moves back to VWAP/equilibrium',
    rules: [
      'Scan for large gap up or gap down',
      'Wait for failure at open',
      'If gap-up stock fails to hold VWAP: enter short',
      'If gap-down stock reclaims VWAP: enter long',
      'Stop loss: above high of failed move for shorts, below low of reclaim for longs',
      'Take profit: gap fill area or 2R',
    ],
    bestFor: ['Stocks'],
    riskLevel: 'Medium-High',
    holdTime: '30m - 3h',
  },
  {
    id: 'gap_go',
    name: 'Gap-and-Go',
    category: 'Intraday',
    color: '#22c55e',
    description: 'Trade gap-up breakouts with catalyst and volume confirmation',
    rules: [
      'Before open, scan for stocks gapping up',
      'Require news, high volume, or strong catalyst',
      'At open, wait for first pullback or opening range breakout',
      'Enter long if price holds above VWAP',
      'Stop loss: below VWAP or opening range low',
      'Take profit: previous premarket high, daily resistance, or 2R',
      'Avoid if gap fades below VWAP',
    ],
    bestFor: ['Stocks'],
    riskLevel: 'High',
    holdTime: '30m - 4h',
  },
  {
    id: 'volume_spike',
    name: 'Volume Spike Breakout',
    category: 'Technical',
    color: '#06b6d4',
    description: 'Trade breakouts confirmed by unusual volume spikes',
    rules: [
      'Calculate average volume over last 20 candles',
      'If current volume is 2x–5x average: mark as volume spike',
      'If price breaks resistance during volume spike: enter long',
      'If price breaks support during volume spike: enter short',
      'Stop loss: back inside previous range',
      'Take profit: 2R or trail under candle lows',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '1h - 4h',
  },
  {
    id: 'momentum_cont',
    name: 'Momentum Continuation',
    category: 'Technical',
    color: '#22c55e',
    description: 'Trade pullbacks within strong directional momentum moves',
    rules: [
      'Scan for stocks up strongly on high relative volume',
      'Confirm price is above VWAP',
      'Confirm higher highs and higher lows',
      'Wait for pullback',
      'Enter when price breaks above pullback high',
      'Stop loss: below pullback low',
      'Take profit: scale out into strength',
      'Exit if price loses VWAP',
    ],
    bestFor: ['Stocks'],
    riskLevel: 'Medium',
    holdTime: '1h - 4h',
  },
  {
    id: 'ma_crossover',
    name: 'Moving Average Crossover',
    category: 'Technical',
    color: '#8b5cf6',
    description: 'Trade directional changes from fast/slow EMA crossovers',
    rules: [
      'Calculate fast EMA, usually 9 or 20',
      'Calculate slow EMA, usually 50 or 200',
      'If fast EMA crosses above slow EMA: enter long',
      'If fast EMA crosses below slow EMA: exit long or enter short',
      'Stop loss: below recent swing low',
      'Take profit: trail stop under fast EMA',
      'Avoid if price is sideways and EMAs are flat',
    ],
    bestFor: ['All Assets'],
    riskLevel: 'Medium',
    holdTime: '1h - 1 week',
  },
  {
    id: 'opening_range',
    name: 'Opening Range Breakout',
    category: 'Intraday',
    color: '#f59e0b',
    description: 'Trade breakouts from the session opening range with volume',
    rules: [
      'At market open, wait 5–30 minutes',
      'Record opening_range_high and opening_range_low',
      'If price breaks above opening_range_high with high volume: enter long',
      'If price breaks below opening_range_low with high volume: enter short',
      'Stop loss: long below opening_range_low, short above opening_range_high',
      'Take profit: 1.5x to 3x risk, or trail with VWAP/EMA',
      'Do not trade if volume is weak or spread is too wide',
    ],
    bestFor: ['Stocks'],
    riskLevel: 'Medium-High',
    holdTime: '30m - 3h',
  },
  {
    id: 'rsi_mean_rev',
    name: 'RSI Mean Reversion',
    category: 'Technical',
    color: '#06b6d4',
    description: 'Trade RSI extremes reverting back to neutral zones',
    rules: [
      'Calculate RSI, usually 14-period',
      'If RSI drops below 30: mark asset as oversold',
      'Wait for RSI to cross back above 30',
      'Enter long',
      'If RSI rises above 70: mark asset as overbought',
      'Wait for RSI to cross back below 70',
      'Enter short or exit long',
      'Stop loss: below recent low for longs, above recent high for shorts',
    ],
    bestFor: ['Range-Bound Assets'],
    riskLevel: 'Medium',
    holdTime: '30m - 2h',
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