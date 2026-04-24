// Backend function to reconcile trades against broker statements
// Detects ghost trades and data discrepancies since last reset

import { base44 } from '@/api/base44Client';

const RESET_DATE = new Date('2026-04-23').toISOString();

// Simulated broker statement fetcher
async function fetchBrokerStatement(broker = 'alpaca') {
  // In production: call broker API (Alpaca, Webull, etc.)
  // For now, return simulated statement with expected trades
  return {
    trades: [
      // Matches: verified trades
      { ticker: 'NVDA', action: 'BUY', quantity: 100, entry_price: 150.25, status: 'filled' },
      { ticker: 'BTC', action: 'SHORT', quantity: 1, entry_price: 65000, status: 'filled' },
      // Ghost: in our DB but not on broker
      // Missing exit: open in our DB but closed on broker
    ],
    statement_date: new Date().toISOString(),
    broker,
  };
}

export async function reconcileTrades(req, res) {
  try {
    // Fetch all trades since reset
    const trades = await base44.entities.Trade.filter(
      { opened_at: { $gte: RESET_DATE } },
      '-opened_at',
      1000
    );

    // Fetch broker statement
    const brokerStatement = await fetchBrokerStatement('alpaca');
    const brokerTrades = brokerStatement.trades;

    // Track reconciliation results
    const results = [];
    const reconciliations = [];

    // Check each trade in our database
    for (const trade of trades) {
      const brokerTrade = brokerTrades.find(
        bt => bt.ticker === trade.ticker && bt.action === trade.action
      );

      let status = 'matched';
      let discrepancyType = null;
      let expectedValue = null;
      let actualValue = null;
      let severity = 'info';

      if (!brokerTrade) {
        // Ghost trade: exists in our DB but not on broker
        status = 'ghost_trade';
        discrepancyType = `Trade not found on broker statement`;
        severity = 'critical';
        actualValue = `${trade.action} ${trade.quantity} ${trade.ticker} @ $${trade.entry_price}`;
      } else {
        // Verify quantity
        if (brokerTrade.quantity !== trade.quantity) {
          status = 'quantity_mismatch';
          discrepancyType = `Quantity mismatch: expected ${brokerTrade.quantity}, got ${trade.quantity}`;
          severity = 'warning';
          expectedValue = `${brokerTrade.quantity}`;
          actualValue = `${trade.quantity}`;
        }

        // Verify entry price (allow 0.5% tolerance for slippage)
        const priceDiff = Math.abs(brokerTrade.entry_price - trade.entry_price) / brokerTrade.entry_price;
        if (priceDiff > 0.005) {
          status = 'price_mismatch';
          discrepancyType = `Price deviation exceeds tolerance: ${(priceDiff * 100).toFixed(2)}%`;
          severity = 'warning';
          expectedValue = `$${brokerTrade.entry_price}`;
          actualValue = `$${trade.entry_price}`;
        }
      }

      // Check for missing exit
      if (trade.status === 'open' && brokerTrade && brokerTrade.status === 'filled') {
        // Broker shows closed but we have it open
        status = 'missing_exit';
        discrepancyType = `Trade is closed on broker but marked open in system`;
        severity = 'critical';
        expectedValue = 'closed';
        actualValue = 'open';
      }

      // Log results
      results.push({
        trade_id: trade.id,
        brain_id: trade.brain_id,
        ticker: trade.ticker,
        status,
        discrepancy_type: discrepancyType,
        expected_value: expectedValue,
        actual_value: actualValue,
        severity,
        reconciled_at: new Date().toISOString(),
      });

      // If discrepancy found, store in TradeReconciliation
      if (status !== 'matched') {
        reconciliations.push({
          trade_id: trade.id,
          brain_id: trade.brain_id,
          ticker: trade.ticker,
          status,
          discrepancy_type: discrepancyType,
          expected_value: expectedValue,
          actual_value: actualValue,
          severity,
          reconciled_at: new Date().toISOString(),
          resolved: false,
        });
      }
    }

    // Bulk create reconciliation records
    if (reconciliations.length > 0) {
      await base44.entities.TradeReconciliation.bulkCreate(reconciliations);
    }

    // Check for trades on broker that aren't in our system (reverse check)
    const ourTickers = trades.map(t => `${t.action}_${t.ticker}`);
    for (const brokerTrade of brokerTrades) {
      const key = `${brokerTrade.action}_${brokerTrade.ticker}`;
      if (!ourTickers.includes(key)) {
        results.push({
          trade_id: null,
          brain_id: 'UNKNOWN',
          ticker: brokerTrade.ticker,
          status: 'data_discrepancy',
          discrepancy_type: 'Trade exists on broker but not in system (orphaned)',
          expected_value: `${brokerTrade.action} ${brokerTrade.quantity}`,
          actual_value: 'missing',
          severity: 'critical',
          reconciled_at: new Date().toISOString(),
        });

        // Also store orphaned trade
        reconciliations.push({
          trade_id: null,
          brain_id: 'UNKNOWN',
          ticker: brokerTrade.ticker,
          status: 'data_discrepancy',
          discrepancy_type: 'Orphaned trade on broker',
          expected_value: `${brokerTrade.action} ${brokerTrade.quantity} @ $${brokerTrade.entry_price}`,
          actual_value: 'not found',
          severity: 'critical',
          reconciled_at: new Date().toISOString(),
          resolved: false,
        });
      }
    }

    // Bulk create remaining reconciliation records
    if (reconciliations.length > 0) {
      await base44.entities.TradeReconciliation.bulkCreate(reconciliations);
    }

    return res.status(200).json({
      success: true,
      reconciliation_summary: {
        total_trades_checked: trades.length,
        matched: results.filter(r => r.status === 'matched').length,
        discrepancies: results.filter(r => r.status !== 'matched').length,
        critical_issues: results.filter(r => r.severity === 'critical').length,
      },
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Reconciliation failed',
      details: error.message,
    });
  }
}