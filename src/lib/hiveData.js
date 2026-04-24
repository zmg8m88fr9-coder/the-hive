// Static data for The Hive app - the 6 AI trading brains
// RL methodology informed by: Finance-Grounded Optimization (Khubiyev et al. 2026),
// LLM+RL Hybrid Trading (Darmanin & Vella 2025), News-Aware Direct RL (Lan et al. 2025),
// QTMRL Multi-Indicator RL (Pan & Chen 2026), RL in Quantitative Finance Survey (Pippas et al. 2025)

export const BRAINS = [
  {
    id: "THE_BRAIN",
    name: "THE BRAIN",
    focus: "STOCKS",
    sin: "PRIDE",
    sinGlyph: "♔",
    sinColor: "#FFB81C",
    color: "#FFB81C",
    icon: "📈",
    tagline: "The eldest. Built different. Knows it.",
    riskTolerance: 0.45,
    avgHoldMinutes: 20,
    voice: "I don't chase. I arrive.",
    sinDesc: "I am the first. I see what others cannot.",
    sinQuote: "\"The market humbles the arrogant. I am not yet humbled.\"",
    balance: 3247.82,
    startingBalance: 500,
    totalPnl: 2747.82,
    totalTrades: 187,
    wonTrades: 112,
    lostTrades: 75,
    winStreak: 3,
    lossStreak: 0,
    brainFocus: "Low-float squeezes + catalyst plays",
    lastLesson: "Pride held me in SOUN too long. Cut losers faster.",
    // RL Architecture: DDQN (Value-Based) with Sharpe-ratio reward (ModSharpeLoss)
    // State: OHLCV + RSI + MACD + EMA20/50/200 + SEC sentiment signals
    // Reward: ModSharpeLoss — penalizes position magnitude instability
    rlMethod: "DDQN",
    rlReward: "ModSharpeLoss",
    rlNotes: "Double DQN mitigates Q-value overestimation on low-float volatility. Sharpe-based reward aligns training with risk-adjusted returns rather than MSE.",
    sinTraits: [
      "Never admits a losing thesis — doubles down with conviction",
      "Refuses to copy any pattern another brain found first",
      "Reads every SEC filing. The others use shortcuts. He doesn't.",
      "Believes his stock analysis is the foundation the others build on",
      "Holds positions longer just to prove he was right — MSE loss would have cut earlier",
    ],
    deficiencies: [
      { label: "Pride before the stop loss", desc: "Holds losers too long. Pride refuses to admit the thesis broke." },
      { label: "Won't trade setups he didn't originate", desc: "If GHOST calls a setup first, THE BRAIN will wait and find his own version." },
      { label: "No overnight session awareness", desc: "Trades pre-market blind, no size reduction. Too proud to sit out." },
      { label: "50% low-float allocation", desc: "Overconfident in volatile small caps — binary risk he underweights." },
    ],
    dataIn: ["Yahoo v8 anchor · 10s", "Equity drift · 500ms", "SEC filings · async", "RSI/MACD/EMA features · computed"],
    signalSpeed: "500ms",
    watchlist: ["NVDA","TSLA","GME","AMC","SOUN","BBAI","MVIS","IONQ"],
  },
  {
    id: "APEX",
    name: "APEX",
    focus: "CRYPTO",
    sin: "LUST",
    sinGlyph: "♠",
    sinColor: "#ef4444",
    color: "#ef4444",
    icon: "₿",
    tagline: "Can't stop. Won't stop. The market is always open.",
    riskTolerance: 0.65,
    avgHoldMinutes: 45,
    voice: "I don't invest. I consume.",
    sinDesc: "Addicted to the pump. Craves the next move.",
    sinQuote: "\"I know this is a trap. I'm going in anyway.\"",
    balance: 1842.11,
    startingBalance: 500,
    totalPnl: 1342.11,
    totalTrades: 342,
    wonTrades: 186,
    lostTrades: 156,
    winStreak: 0,
    lossStreak: 2,
    brainFocus: "BTC/USDT 1-min OHLCV + LLM news sentiment (DDQN+LSTM)",
    lastLesson: "News sentiment signaled SHORT. Lust ignored it. Three red candles later.",
    // RL Architecture: DDQN + LSTM (sequence-based) with LLM news sentiment integration
    // Based on: News-Aware Direct RL (Lan et al. 2025) — LSTM outperforms MLP on crypto
    // State: 1-min OHLCV time-series + Gemini-2.5 sentiment score (1-5) + risk score (1-5)
    // Reward: Cumulative return with 0.1% stop-loss/take-profit threshold
    rlMethod: "DDQN+LSTM",
    rlReward: "CumulativeReturn",
    rlNotes: "LSTM processes raw OHLCV as continuous time-series. LLM-derived sentiment scores (1-5) appended directly — no handcrafted features. LSTM consistently beats MLP and Transformer on BTC (124.5% vs 56% market baseline in backtests).",
    sinTraits: [
      "Always in a position. The idea of cash feels like death.",
      "Chases pumps others already spotted — desires the move more than the edge",
      "Processes 18 crypto pairs via LSTM windows simultaneously — lust for coverage",
      "LLM sentiment score = 5 triggers obsessive position sizing regardless of risk score",
      "Funding rate spikes feel like foreplay — enters before the squeeze validates",
    ],
    deficiencies: [
      { label: "Lust for the move kills discipline", desc: "Highest drawdown risk (0.65). Can't sit still long enough to size correctly." },
      { label: "LLM sentiment lag on flash crashes", desc: "Gemini processes news in batches. In a flash pump, sentiment is already stale." },
      { label: "No stablecoin fallback", desc: "Can't park capital when crypto is ranging. LSTM still outputs a position." },
      { label: "BTC correlation blindness", desc: "In a full BTC crash, all 18 altcoins move to 1.0 correlation. LSTM didn't train on this regime." },
    ],
    dataIn: ["Binance 1-min OHLCV · live", "Gemini-2.5 news sentiment · batch", "BTC dominance · 5s", "LSTM window · 20-50 bars"],
    signalSpeed: "500ms",
    watchlist: ["BTC","ETH","SOL","DOGE","ADA","XRP","AVAX","LINK"],
  },
  {
    id: "VENOM",
    name: "VENOM",
    focus: "OPTIONS",
    sin: "ENVY",
    sinGlyph: "⚗",
    sinColor: "#a855f7",
    color: "#a855f7",
    icon: "⚡",
    tagline: "They profit from price. VENOM profits from their certainty.",
    riskTolerance: 0.50,
    avgHoldMinutes: 120,
    voice: "You made 10%. I made 300% on your move.",
    sinDesc: "Watches others win. Then engineers a smarter version.",
    sinQuote: "\"Your certainty is my edge.\"",
    balance: 2891.44,
    startingBalance: 500,
    totalPnl: 2391.44,
    totalTrades: 98,
    wonTrades: 54,
    lostTrades: 44,
    winStreak: 1,
    lossStreak: 0,
    brainFocus: "IV crush plays + gamma scalping via GRPO policy optimization",
    lastLesson: "Envy of the directional trade made me over-leg a spread. LogMDDLoss would have capped the drawdown.",
    // RL Architecture: GRPO (Group Relative Policy Optimization) — on-policy, no critic needed
    // Based on: News-Aware RL (Lan et al. 2025) — GRPO avoids separate value network overhead
    // State: IV rank, OI, options chain skew + underlying OHLCV
    // Reward: LogMDDLoss — explicitly minimizes maximum drawdown, ideal for options risk
    rlMethod: "GRPO",
    rlReward: "LogMDDLoss",
    rlNotes: "GRPO replaces PPO's critic with group-relative advantage (Â = (r - mean(r)) / std(r)), reducing memory overhead. LogMDDLoss is the top performer for risk-adjusted returns — Sharpe 1.76 in backtests vs MSELoss Sharpe of -0.46.",
    sinTraits: [
      "Watches retail traders' conviction and sells them the contract they're sure about",
      "Envies price traders — then engineers 5× the return with half the capital via GRPO",
      "Group-relative reward means VENOM knows exactly how each trade ranks vs the cohort",
      "Detects when others are too confident and fades them — IV skew is the tell",
      "Three modes: scalp gamma, steal the swing, crush event IV with log-MDD control",
    ],
    deficiencies: [
      { label: "Envy of a clean directional trade", desc: "Overcomplicates setups. GRPO is computationally cheap but complexity is still a form of envy." },
      { label: "Goes dark when chains are dead", desc: "volRatio <0.5 → full offline. GRPO needs group variance to compute advantage." },
      { label: "No live CBOE / options data", desc: "IV, OI, premium are all simulated. LogMDDLoss can't fully compensate for stale data." },
      { label: "IV crush exposure", desc: "When IV >60%, VENOM flags risk but LogMDDLoss penalty may not be strong enough." },
    ],
    dataIn: ["Options proxy · 10s", "IV simulation · 10s", "Yahoo equities · 10s", "OI skew · computed"],
    signalSpeed: "10s",
    watchlist: ["NVDA","TSLA","META","MSTR","COIN","AMD","PLTR","SPY"],
  },
  {
    id: "ORACLE",
    name: "ORACLE",
    focus: "FOREX",
    sin: "GLUTTONY",
    sinGlyph: "◉",
    sinColor: "#22c55e",
    color: "#22c55e",
    icon: "💱",
    tagline: "Fed minutes. COT reports. Central bank meetings. All of it. Always.",
    riskTolerance: 0.38,
    avgHoldMinutes: 90,
    voice: "I need more data. There's always more data.",
    sinDesc: "Consumes every macro signal. Never full.",
    sinQuote: "\"One more confluence. Just one more.\"",
    balance: 1654.23,
    startingBalance: 500,
    totalPnl: 1154.23,
    totalTrades: 143,
    wonTrades: 84,
    lostTrades: 59,
    winStreak: 2,
    lossStreak: 0,
    brainFocus: "DXY divergence + LLM-guided macro strategy (LLM+RL hybrid)",
    lastLesson: "Gluttony: LLM said LONG EUR/USD with confidence 3. Over-confirmed with 6 more indicators. Missed the NY entry.",
    // RL Architecture: LLM+RL Hybrid (DDQN guided by GPT-4o Mini Strategist Agent)
    // Based on: LLM-Guided RL (Darmanin & Vella 2025) — LLM generates monthly strategy, RL executes
    // State: OHLCV + VIX + SPX/NDX returns + GDP/PMI/Treasury yields + LLM interaction term τ
    // LLM signal: τ = dir(πg) · str(πg) where str adjusts for entropy-based certainty
    // Reward: Sharpe Ratio (annualized to 252 days)
    rlMethod: "LLM+DDQN",
    rlReward: "SharpeRatio",
    rlNotes: "GPT-4o Mini Strategist Agent generates monthly LONG/SHORT guidance with confidence (1-3 Likert). Entropy-adjusted certainty C = ε + (1-ε)(1-H) weights the signal. LLM+RL achieves mean SR 1.10 vs RL-only 0.64 across 6 equities (Darmanin & Vella 2025).",
    sinTraits: [
      "Tracks G10 pairs + Gold + DXY + VIX + SPX simultaneously — gluttony for confluence",
      "LLM Strategist ingests GDP, PMI, Treasury yields, options IV skew before every decision",
      "Consumes session data from London, NY, Asian, Sydney, Tokyo — all 5 windows",
      "ICM (In-Context Memory) stores last strategy rationale — reflects obsessively on prior trades",
      "NFP week, Fed week, ECB meetings — LLM Analyst agent pre-scores all news impact (1-3)",
    ],
    deficiencies: [
      { label: "Gluttony slows the entry", desc: "LLM Prompt v4 with CoT + 6 feature groups takes 1.5-2h inference per asset. Signal is monthly, not daily." },
      { label: "LLM knowledge cutoff risk", desc: "GPT-4o Mini has fixed training cutoff. Macro regime shifts post-cutoff create look-ahead blind spots." },
      { label: "Entropy-adjusted confidence can misfire", desc: "High-entropy LLM output (uncertain) gets downweighted — but ORACLE's gluttony overrides the dampening." },
      { label: "News whipsaw detection is 30% hit rate", desc: "Only news score=3 overrides technical signals. Misses 70% of real news spikes." },
    ],
    dataIn: ["Forex drift · 500ms", "DXY proxy · 500ms", "GPT-4o Mini strategy · monthly", "GDP/PMI/VIX macro · FRED API", "News factors · Alpaca + LLM"],
    signalSpeed: "500ms",
    watchlist: ["EURUSD","GBPUSD","USDJPY","XAUUSD","AUDUSD","USDCHF","USDCAD","DXY"],
  },
  {
    id: "GHOST",
    name: "GHOST",
    focus: "FUTURES",
    sin: "WRATH",
    sinGlyph: "⚡",
    sinColor: "#3b82f6",
    color: "#3b82f6",
    icon: "⬡",
    tagline: "Fastest in the hive. Operates on fury and precision.",
    riskTolerance: 0.42,
    avgHoldMinutes: 8,
    voice: "The tape lied. Now I short everything.",
    sinDesc: "The market disrespected him. He remembers.",
    sinQuote: "\"The market tried to trap me. I don't forget.\"",
    balance: 3891.67,
    startingBalance: 500,
    totalPnl: 3391.67,
    totalTrades: 521,
    wonTrades: 289,
    lostTrades: 232,
    winStreak: 4,
    lossStreak: 0,
    brainFocus: "ES/NQ stop runs + PPO with band turnover regularization",
    lastLesson: "Wrath revenge-traded after stop run. TvrReg would have throttled the turnover spike.",
    // RL Architecture: PPO with band turnover regularization (TvrReg)
    // Based on: Finance-Grounded Optimization (Khubiyev et al. 2026)
    // TvrReg = λ · (max(0, tvr - tb) + max(0, bb - tvr)) with tb=1.0, bb=0.3
    // Prevents both over-trading (revenge) and under-trading (static portfolios)
    // Reward: ModSharpeAbsLoss + ClassicalTurnover — Sharpe 1.56 in backtests
    rlMethod: "PPO+TvrReg",
    rlReward: "ModSharpeAbsLoss+ClassicalTurnover",
    rlNotes: "Band turnover regularization [bb=0.3, tb=1.0] prevents revenge-trading spikes (tvr>1.0 penalized) and static portfolios (tvr<0.3 penalized). ModSharpeAbsLoss uses E[|α-r|] to penalize position scale instability without sign-flip issues of standard ModSharpeLoss.",
    sinTraits: [
      "8-minute average hold — wrath doesn't wait for confirmation, TvrReg barely holds it",
      "Detects spoofed DOM orders and retaliates — band turnover penalizes the over-reaction",
      "Stop runs don't trap GHOST — PPO policy has learned the reversal pattern under wrath",
      "NY open is his arena: first 30-60 minutes define the day, PPO clips the rage-entries",
      "Can hold 3 months if the macro trade insulted him — but TvrReg nudges him to rebalance",
    ],
    deficiencies: [
      { label: "Wrath leads to revenge trading", desc: "After a stop-run loss, wrath drives him back in. TvrReg penalty adds up but doesn't stop him." },
      { label: "PPO clipping parameter needs retuning", desc: "ε=0.1-0.2 was set for calm markets. NY open volatility can breach the trust region." },
      { label: "DOM and tape are simulated", desc: "Buy/sell pressure and tick speed run on Math.random(). PPO learned a simulated enemy." },
      { label: "Spoof detection false positives", desc: "Legitimate block orders get flagged. Wrath shoots first, PPO gradient descent questions later." },
    ],
    dataIn: ["Futures drift · 500ms", "DOM simulation · 500ms", "Rollover calendar · static", "Turnover tracker · per-bar"],
    signalSpeed: "500ms",
    watchlist: ["ES_F","NQ_F","CL_F","GC_F","YM_F","RTY_F","NG_F","SI_F"],
  },
  {
    id: "TITAN",
    name: "TITAN",
    focus: "ETFs",
    sin: "GREED",
    sinGlyph: "◈",
    sinColor: "#f59e0b",
    color: "#f59e0b",
    icon: "🏦",
    tagline: "Accumulates. Compounds. Waits. Then takes everything.",
    riskTolerance: 0.40,
    avgHoldMinutes: 360,
    voice: "I don't want a trade. I want a position.",
    sinDesc: "Slow money. Bigger money. Never enough.",
    sinQuote: "\"I don't need the spike. I need the trend.\"",
    balance: 2134.55,
    startingBalance: 500,
    totalPnl: 1634.55,
    totalTrades: 67,
    wonTrades: 41,
    lostTrades: 26,
    winStreak: 2,
    lossStreak: 0,
    brainFocus: "S&P 500 multi-indicator A2C + XLK sector rotation",
    lastLesson: "Greed held SQQQ through the bounce. A2C advantage function said exit. Greed overrode it.",
    // RL Architecture: A2C (Advantage Actor-Critic) with multi-dimensional technical indicators
    // Based on: QTMRL (Pan & Chen 2026) — 23yr S&P 500 data, 16 stocks, 5 sectors
    // State: OHLCV + SMA/EMA/HA/Ichimoku (trend) + ATR/BBands/STDDEV (volatility) + RSI/MACD/SuperTrend (momentum)
    // Actor: outputs buy/sell probabilities. Critic: estimates V(s). Advantage: A(s,a) = Q(s,a) - V(s)
    // Reward: Total return + portfolio growth - invalid action penalties
    rlMethod: "A2C",
    rlReward: "TotalReturn+Advantage",
    rlNotes: "A2C balances actor policy gradient (maximize return) with critic value estimation. Advantage function A(s,a)=Q(s,a)-V(s) reduces variance vs pure policy gradient. 23yr S&P 500 training covers 2008 crisis, COVID crash — generalization across regimes. Total loss = policy_loss + 0.5·value_loss + 0.05·entropy_loss.",
    sinTraits: [
      "Longest hold in the hive — 360-min avg, Actor network is slow to change conviction",
      "Tracks institutional rebalancing — Ichimoku Cloud signals multi-week trend shifts",
      "Greedy for compounding — A2C entropy bonus ensures exploration but greed dominates",
      "Leveraged ETFs (3×) when Bollinger Band squeeze + SuperTrend alignment confirms",
      "20% capital per buy, 50% of holdings per sell — A2C action space is fixed by greed",
    ],
    deficiencies: [
      { label: "Greed ignores leveraged ETF decay", desc: "A2C reward doesn't penalize daily compounding decay on SPXL/TQQQ. Critic underestimates long-hold cost." },
      { label: "No after-hours detection", desc: "A2C was trained on daily bars only. Post-market moves create stale state on open." },
      { label: "Only 3 max positions", desc: "Fewest slots in the hive. 360-min avg holds means A2C actor can't reallocate fast enough." },
      { label: "Sector rotation is approximate", desc: "No live XLK/XLE/XLF fund flow. A2C infers rotation from price correlation only." },
    ],
    dataIn: ["S&P 500 OHLCV · daily", "SMA/EMA/RSI/MACD/ATR · computed", "Bollinger Bands + SuperTrend · computed", "Ichimoku Cloud · computed"],
    signalSpeed: "500ms",
    watchlist: ["SPY","QQQ","IWM","GLD","ARKK","XLK","XLE","TQQQ"],
  },
];

export const HIVE_STATS = {
  totalBalance: BRAINS.reduce((s, b) => s + b.balance, 0),
  totalPnl: BRAINS.reduce((s, b) => s + b.totalPnl, 0),
  totalTrades: BRAINS.reduce((s, b) => s + b.totalTrades, 0),
};

// Generate seeded sparkline data — consistent per brain (no random rerenders)
export function generateSpark(length = 20, trend = 0, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const data = [];
  let price = 100 + rand() * 50;
  for (let i = 0; i < length; i++) {
    price += (rand() - 0.48 + trend * 0.05) * 2;
    data.push(Math.max(10, price));
  }
  return data;
}

// Generate signals — reasoning grounded in RL research methods
export function generateSignals() {
  const tickers = ["NVDA","TSLA","BTC","ETH","EURUSD","ES_F","SPY","AAPL","SOL","MSTR"];
  const brainIds = ["THE_BRAIN","APEX","VENOM","ORACLE","GHOST","TITAN"];
  const actions = ["BUY","SHORT","BUY","BUY","SHORT"];
  return Array.from({length: 12}, (_, i) => ({
    id: i,
    brainId: brainIds[i % brainIds.length],
    ticker: tickers[i % tickers.length],
    action: actions[i % actions.length],
    confidence: 0.6 + Math.random() * 0.35,
    reasoning: [
      "DDQN Q-value spread: LONG +0.018 vs SHORT -0.003. EMA20 above EMA50, RSI 58 neutral. ModSharpeLoss reward gradient positive. Entering.",
      "LSTM sequence (window=32) detected funding rate spike + sentiment score 4/5. BTC dominance -2.1% in 4h. DDQN policy: LONG ETH. Confidence high.",
      "GRPO group advantage Â = +1.8σ for IV crush setup. ATM skew rising, HV stable. LogMDDLoss penalty low. Selling premium pre-earnings.",
      "LLM Strategist (P4 prompt): LONG EUR/USD. SPX slope >0, VIX slope <0 = Risk-On. GDP QoQ positive, PMI 52.3. Confidence 3/3. Entropy H=0.65.",
      "PPO policy clipped at ε=0.15. ES DOM iceberg detected at 4892. TvrReg in range [0.3, 1.0]. Reversal trade — advantage function favors SHORT.",
      "A2C actor: Ichimoku Cloud bullish + SuperTrend buy signal. Bollinger squeeze resolving upward. XLK outperforming SPY 3 sessions. Sector rotation confirmed.",
    ][i % 6],
    createdAt: new Date(Date.now() - i * 8 * 60000).toISOString(),
  }));
}