// Scheduled backend function — runs daily to fetch broker statements and reconcile trades
// Triggered via Base44 scheduled tasks (e.g., 2:00 AM UTC daily)

import { base44 } from '@/api/base44Client';

// Supported brokers with API details
const BROKERS = {
  alpaca: {
    name: 'Alpaca',
    endpoint: 'https://api.alpaca.markets/v2',
    paper: true,
  },
  webull: {
    name: 'Webull',
    endpoint: 'https://api.webull.com/trade',
  },
};

async function fetchBrokerStatement(broker, credentials) {
  // In production: use stored OAuth tokens or API keys from Base44 secrets
  // For now: return simulated broker statement
  
  if (broker === 'alpaca') {
    try {
      // In production: const res = await fetch(`${BROKERS.alpaca.endpoint}/account/activities`, {
      //   headers: { 'Authorization': `Bearer ${credentials.accessToken}` }
      // });
      
      // Simulated: fetch last 30 days of trades
      return {
        broker: 'alpaca',
        trades: [],
        statement_date: new Date().toISOString(),
        status: 'success',
      };
    } catch (error) {
      return {
        broker: 'alpaca',
        status: 'error',
        error: error.message,
        statement_date: new Date().toISOString(),
      };
    }
  }

  if (broker === 'webull') {
    try {
      // In production: query Webull API with OAuth token
      return {
        broker: 'webull',
        trades: [],
        statement_date: new Date().toISOString(),
        status: 'success',
      };
    } catch (error) {
      return {
        broker: 'webull',
        status: 'error',
        error: error.message,
        statement_date: new Date().toISOString(),
      };
    }
  }

  return { status: 'unsupported_broker', broker };
}

async function triggerReconciliation(trades) {
  // Call the existing reconcileTrades function
  try {
    // Fetch all trades since last reconciliation
    const dbTrades = await base44.entities.Trade.list('-opened_at', 1000);

    // Compare with broker statement and flag discrepancies
    const discrepancies = [];

    for (const trade of dbTrades) {
      const brokerTrade = trades.find(
        t => t.ticker === trade.ticker && t.action === trade.action
      );

      if (!brokerTrade) {
        discrepancies.push({
          trade_id: trade.id,
          brain_id: trade.brain_id,
          ticker: trade.ticker,
          status: 'ghost_trade',
          discrepancy_type: 'Trade not found on broker statement',
          severity: 'critical',
          reconciled_at: new Date().toISOString(),
          resolved: false,
        });
      } else {
        // Check quantity and price
        if (brokerTrade.quantity !== trade.quantity) {
          discrepancies.push({
            trade_id: trade.id,
            brain_id: trade.brain_id,
            ticker: trade.ticker,
            status: 'quantity_mismatch',
            discrepancy_type: `Qty mismatch: expected ${brokerTrade.quantity}, got ${trade.quantity}`,
            severity: 'warning',
            reconciled_at: new Date().toISOString(),
            resolved: false,
          });
        }

        const priceDiff =
          Math.abs(brokerTrade.entry_price - trade.entry_price) / brokerTrade.entry_price;
        if (priceDiff > 0.005) {
          discrepancies.push({
            trade_id: trade.id,
            brain_id: trade.brain_id,
            ticker: trade.ticker,
            status: 'price_mismatch',
            discrepancy_type: `Price deviation: ${(priceDiff * 100).toFixed(2)}%`,
            severity: 'warning',
            reconciled_at: new Date().toISOString(),
            resolved: false,
          });
        }
      }
    }

    // Bulk create discrepancy records
    if (discrepancies.length > 0) {
      await base44.entities.TradeReconciliation.bulkCreate(discrepancies);
    }

    return {
      discrepancies_found: discrepancies.length,
      critical: discrepancies.filter(d => d.severity === 'critical').length,
      warnings: discrepancies.filter(d => d.severity === 'warning').length,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
    };
  }
}

export async function dailyBrokerReconciliation(req, res) {
  const reconciliationResults = [];

  try {
    // Iterate over supported brokers
    for (const [brokerKey, brokerConfig] of Object.entries(BROKERS)) {
      // In production: fetch user's OAuth credentials for this broker
      // For now: simulate broker statement
      
      const statement = await fetchBrokerStatement(brokerKey, {});

      if (statement.status === 'error') {
        reconciliationResults.push({
          broker: brokerKey,
          status: 'fetch_error',
          error: statement.error,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      // Trigger reconciliation with fetched trades
      const reconcResult = await triggerReconciliation(statement.trades || []);

      reconciliationResults.push({
        broker: brokerKey,
        status: 'success',
        ...reconcResult,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Daily broker reconciliation completed',
      results: reconciliationResults,
      execution_date: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Daily reconciliation failed',
      details: error.message,
      results: reconciliationResults,
    });
  }
}