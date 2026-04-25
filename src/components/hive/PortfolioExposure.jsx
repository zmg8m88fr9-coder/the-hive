import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ASSET_CLASS_CONFIG = {
  stock: { label: 'STOCKS', color: '#C8892A', icon: '⊞' },
  crypto: { label: 'CRYPTO', color: '#D4A020', icon: '◈' },
  forex: { label: 'FOREX', color: '#3E9E6B', icon: '⇄' },
  futures: { label: 'FUTURES', color: '#3A74D4', icon: '⧬' },
  options: { label: 'OPTIONS', color: '#8A54E0', icon: '⊕' },
  etf: { label: 'ETF', color: '#06b6d4', icon: '◆' },
};

export default function PortfolioExposure() {
  const { data: trades = [] } = useQuery({
    queryKey: ['trades-exposure'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 200),
  });

  const exposure = useMemo(() => {
    const openTrades = trades.filter(t => t.status === 'open');
    
    if (openTrades.length === 0) {
      return { byAsset: {}, byTicker: {}, totalRisk: 0, positions: 0 };
    }

    // Calculate notional exposure per trade
    const tradesWithRisk = openTrades.map(t => ({
      ...t,
      notional: (t.entry_price ?? 0) * (t.quantity ?? 1),
      riskDirection: t.action === 'BUY' ? 1 : -1, // For aggregate calc
    }));

    const totalRisk = tradesWithRisk.reduce((sum, t) => sum + Math.abs(t.notional), 0);

    // Group by asset class
    const byAsset = {};
    tradesWithRisk.forEach(trade => {
      const assetClass = trade.asset_type || 'stock';
      if (!byAsset[assetClass]) {
        byAsset[assetClass] = {
          notional: 0,
          count: 0,
          tickers: new Set(),
        };
      }
      byAsset[assetClass].notional += Math.abs(trade.notional);
      byAsset[assetClass].count++;
      byAsset[assetClass].tickers.add(trade.ticker);
    });

    // Group by ticker
    const byTicker = {};
    tradesWithRisk.forEach(trade => {
      if (!byTicker[trade.ticker]) {
        byTicker[trade.ticker] = {
          notional: 0,
          count: 0,
          assetClass: trade.asset_type || 'stock',
          direction: trade.action,
        };
      }
      byTicker[trade.ticker].notional += Math.abs(trade.notional);
      byTicker[trade.ticker].count++;
    });

    return {
      byAsset: Object.entries(byAsset).map(([type, data]) => ({
        type,
        notional: data.notional,
        count: data.count,
        percentage: totalRisk > 0 ? (data.notional / totalRisk) * 100 : 0,
        tickerCount: data.tickers.size,
      })),
      byTicker: Object.entries(byTicker).map(([ticker, data]) => ({
        ticker,
        notional: data.notional,
        count: data.count,
        assetClass: data.assetClass,
        percentage: totalRisk > 0 ? (data.notional / totalRisk) * 100 : 0,
      })),
      totalRisk,
      positions: openTrades.length,
    };
  }, [trades]);

  if (exposure.positions === 0) {
    return (
      <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-4">
        <div className="text-[8px] font-bold tracking-widest text-[#8A7F6D] mb-3">PORTFOLIO EXPOSURE</div>
        <div className="text-center py-8 text-[8px] text-[#333]">No open positions</div>
      </div>
    );
  }

  const sortedByAsset = [...exposure.byAsset].sort((a, b) => b.notional - a.notional);
  const sortedByTicker = [...exposure.byTicker].sort((a, b) => b.notional - a.notional).slice(0, 8);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-4">
        <div className="text-[8px] font-bold tracking-widest text-[#8A7F6D] mb-3">PORTFOLIO EXPOSURE</div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#1A1510] rounded p-2.5 text-center">
            <div className="text-[10px] font-black mono" style={{ color: '#C8892A' }}>
              ${exposure.totalRisk.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[6px] text-[#4D4538] tracking-widest mt-1">TOTAL RISK</div>
          </div>
          <div className="bg-[#1A1510] rounded p-2.5 text-center">
            <div className="text-[10px] font-black mono" style={{ color: '#3E9E6B' }}>
              {exposure.positions}
            </div>
            <div className="text-[6px] text-[#4D4538] tracking-widest mt-1">OPEN POS</div>
          </div>
          <div className="bg-[#1A1510] rounded p-2.5 text-center">
            <div className="text-[10px] font-black mono" style={{ color: '#3A74D4' }}>
              {exposure.byAsset.length}
            </div>
            <div className="text-[6px] text-[#4D4538] tracking-widest mt-1">ASSET CLASS</div>
          </div>
        </div>

        {/* By Asset Class */}
        <div className="space-y-2">
          <div className="text-[7px] text-[#4D4538] tracking-widest">EXPOSURE BY ASSET CLASS</div>
          {sortedByAsset.map(asset => {
            const config = ASSET_CLASS_CONFIG[asset.type] || { label: asset.type.toUpperCase(), color: '#666', icon: '◆' };
            return (
              <div key={asset.type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span className="text-[7px] font-bold" style={{ color: config.color }}>{config.label}</span>
                    <span className="text-[6px] text-[#4D4538]">({asset.count} pos, {asset.tickerCount} tickers)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[7px] font-bold" style={{ color: config.color }}>
                      {asset.percentage.toFixed(1)}%
                    </div>
                    <div className="text-[6px] text-[#4D4538]">
                      ${asset.notional.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                <div className="h-1.5 bg-[#1A1510] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${asset.percentage}%`, background: config.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Tickers */}
      <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-4">
        <div className="text-[8px] font-bold tracking-widest text-[#8A7F6D] mb-3">TOP EXPOSURES BY TICKER</div>
        <div className="space-y-2">
          {sortedByTicker.map((ticker, i) => {
            const config = ASSET_CLASS_CONFIG[ticker.assetClass] || { color: '#666' };
            return (
              <div key={ticker.ticker} className="flex items-center justify-between px-2 py-1.5 bg-[#1A1510] rounded">
                <div className="flex items-center gap-2">
                  <span className="text-[7px] text-[#4D4538] font-bold w-4 text-center">#{i + 1}</span>
                  <span className="mono font-bold text-[8px] text-[#DDD6C4]" style={{ minWidth: '40px' }}>
                    {ticker.ticker}
                  </span>
                  <span className="text-[6px] text-[#4D4538]">({ticker.count})</span>
                </div>
                <div className="text-right">
                  <div className="text-[7px] font-bold" style={{ color: config.color }}>
                    {ticker.percentage.toFixed(1)}%
                  </div>
                  <div className="text-[6px] text-[#4D4538]">
                    ${ticker.notional.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}