// Simulate real-time price feeds for open trades
const priceCache = {};

function getSimulatedPrice(ticker) {
  if (!priceCache[ticker]) {
    // Initialize with random base price
    priceCache[ticker] = { base: 100 + Math.random() * 200, lastUpdate: Date.now() };
  }

  const cache = priceCache[ticker];
  const timeDiff = (Date.now() - cache.lastUpdate) / 1000; // seconds
  
  // Simulate price drift (random walk)
  const drift = (Math.random() - 0.5) * 0.02 * timeDiff; // 2% max drift per second
  cache.base = Math.max(0.01, cache.base * (1 + drift));
  cache.lastUpdate = Date.now();
  
  return cache.base;
}

export function calculateUnrealizedPnL(trade) {
  if (trade.status !== 'open' || !trade.entry_price) return 0;
  
  const currentPrice = getSimulatedPrice(trade.ticker);
  if (trade.action === 'BUY') {
    return (currentPrice - trade.entry_price) * (trade.quantity || 1);
  } else {
    return (trade.entry_price - currentPrice) * (trade.quantity || 1);
  }
}

export function calculateTotalUnrealizedPnL(openTrades) {
  return openTrades.reduce((sum, trade) => sum + calculateUnrealizedPnL(trade), 0);
}

export function clearPriceCache() {
  Object.keys(priceCache).forEach(key => delete priceCache[key]);
}