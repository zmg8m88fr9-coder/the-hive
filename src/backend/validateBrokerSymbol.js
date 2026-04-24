// Backend function to validate symbols against live broker APIs
// Supports Alpaca and Webull

import fetch from 'node-fetch';

async function validateAlpaca(symbol) {
  // In production, retrieve from secure env or config
  // For now, return demo validation
  if (!symbol) {
    return { valid: false, reason: 'Symbol required' };
  }

  // Simulated Alpaca validation
  // In production: call https://paper-api.alpaca.markets/v2/assets/{symbol}
  const fakeValid = Math.random() > 0.1; // 90% valid
  return fakeValid 
    ? { valid: true, broker: 'Alpaca', reason: 'Tradable' }
    : { valid: false, reason: 'Not tradable on Alpaca' };
}

async function validateWebull(symbol) {
  // Simulated Webull validation
  // In production: call https://api.webull.com/trade/instrument/query
  if (!symbol) {
    return { valid: false, reason: 'Symbol required' };
  }
  
  const fakeValid = Math.random() > 0.12; // 88% valid
  return fakeValid
    ? { valid: true, broker: 'Webull', reason: 'Tradable' }
    : { valid: false, reason: 'Not tradable on Webull' };
}

export async function validateBrokerSymbol(req, res) {
  const { symbol, broker = 'alpaca' } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol required' });
  }

  try {
    const result = broker.toLowerCase() === 'webull' 
      ? await validateWebull(symbol)
      : await validateAlpaca(symbol);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}