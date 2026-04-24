import { BRAINS } from './hiveData';

// Generates 90 days of simulated daily performance history for all brains
export function generatePerformanceHistory() {
  const DAYS = 90;
  const result = {};

  BRAINS.forEach(brain => {
    const pnlPct = ((brain.balance - brain.startingBalance) / brain.startingBalance) * 100;
    const dailyDrift = pnlPct / DAYS;
    const winRate = brain.wonTrades / brain.totalTrades;
    const volatility = brain.riskTolerance * 3.5;

    let equity = brain.startingBalance;
    let peak = equity;
    const days = [];

    // Seeded noise so it's consistent per brain
    let seed = brain.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const returns = [];

    for (let i = 0; i < DAYS; i++) {
      const r = rand();
      // Bias toward positive based on win rate, add noise
      const dailyReturn = (r - (1 - winRate) + 0.02) * volatility + dailyDrift * 0.8;
      const dailyPct = dailyReturn;
      equity = equity * (1 + dailyPct / 100);
      equity = Math.max(equity, brain.startingBalance * 0.5); // floor at 50% starting
      peak = Math.max(peak, equity);

      const drawdown = ((peak - equity) / peak) * 100;
      const roi = ((equity - brain.startingBalance) / brain.startingBalance) * 100;
      returns.push(dailyPct);

      const date = new Date();
      date.setDate(date.getDate() - (DAYS - i));

      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        equity: parseFloat(equity.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        drawdown: parseFloat(drawdown.toFixed(2)),
        dailyReturn: parseFloat(dailyPct.toFixed(3)),
      });
    }

    // Scale last equity to match brain's actual balance, then recalculate peak-based drawdown
    const scaleFactor = brain.balance / days[days.length - 1].equity;
    let scaledPeak = brain.startingBalance;
    days.forEach(d => {
      d.equity = parseFloat((d.equity * scaleFactor).toFixed(2));
      d.roi = parseFloat(((d.equity - brain.startingBalance) / brain.startingBalance * 100).toFixed(2));
      scaledPeak = Math.max(scaledPeak, d.equity);
      d.drawdown = parseFloat(((scaledPeak - d.equity) / scaledPeak * 100).toFixed(2));
    });

    // Calculate Sharpe rolling 30d
    for (let i = 0; i < days.length; i++) {
      const window = returns.slice(Math.max(0, i - 29), i + 1);
      const mean = window.reduce((s, v) => s + v, 0) / window.length;
      const variance = window.reduce((s, v) => s + (v - mean) ** 2, 0) / window.length;
      const std = Math.sqrt(variance) || 0.0001;
      const riskFreeDaily = 5.25 / 252 / 100;
      days[i].sharpe = parseFloat(((mean / 100 - riskFreeDaily) / (std / 100) * Math.sqrt(252)).toFixed(2));
    }

    result[brain.id] = days;
  });

  return result;
}

// Summary stats per brain derived from history
export function getBrainStats(history) {
  const stats = {};
  Object.entries(history).forEach(([id, days]) => {
    const last = days[days.length - 1];
    const maxDD = Math.max(...days.map(d => d.drawdown));
    const avgSharpe = days.slice(-30).reduce((s, d) => s + d.sharpe, 0) / 30;
    const currentSharpe = last.sharpe;
    stats[id] = {
      roi: last.roi,
      maxDrawdown: parseFloat(maxDD.toFixed(2)),
      currentSharpe: parseFloat(currentSharpe.toFixed(2)),
      avgSharpe30d: parseFloat(avgSharpe.toFixed(2)),
    };
  });
  return stats;
}