import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../lib/hiveData';

export default function CorrelationMap() {
  const [viewMode, setViewMode] = useState('assets'); // 'assets' | 'strategies'
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades-correlation'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 500),
  });

  // Analyze asset overlap and strategy correlation
  const analysis = useMemo(() => {
    if (!trades.length) return { assetOverlap: {}, brainPairs: {}, riskAssets: [], playTypeOverlap: {} };

    // Group trades by asset and brain
    const assetTrades = {};
    trades.forEach(trade => {
      if (!assetTrades[trade.ticker]) {
        assetTrades[trade.ticker] = {};
      }
      if (!assetTrades[trade.ticker][trade.brain_id]) {
        assetTrades[trade.ticker][trade.brain_id] = [];
      }
      assetTrades[trade.ticker][trade.brain_id].push(trade);
    });

    // Find assets with multiple brains (concentration risk)
    const assetOverlap = {};
    const riskAssets = [];
    Object.entries(assetTrades).forEach(([asset, brainMap]) => {
      const brainCount = Object.keys(brainMap).length;
      assetOverlap[asset] = {
        count: brainCount,
        brains: Object.keys(brainMap),
        trades: Object.values(brainMap).flat(),
      };
      if (brainCount > 1) {
        riskAssets.push({ asset, brainCount, brains: Object.keys(brainMap) });
      }
    });

    // Calculate brain-pair overlap (how many assets they trade together)
    const brainPairs = {};
    Object.entries(assetTrades).forEach(([asset, brainMap]) => {
      const brainIds = Object.keys(brainMap);
      if (brainIds.length > 1) {
        for (let i = 0; i < brainIds.length; i++) {
          for (let j = i + 1; j < brainIds.length; j++) {
            const pair = [brainIds[i], brainIds[j]].sort().join('-');
            if (!brainPairs[pair]) {
              brainPairs[pair] = { overlap: 0, assets: [] };
            }
            brainPairs[pair].overlap++;
            brainPairs[pair].assets.push(asset);
          }
        }
      }
    });

    // Play type overlap (strategies trading same asset)
    const playTypeOverlap = {};
    Object.entries(assetTrades).forEach(([asset, brainMap]) => {
      Object.values(brainMap).forEach(brainTrades => {
        brainTrades.forEach(trade => {
          if (trade.play_type) {
            if (!playTypeOverlap[trade.play_type]) {
              playTypeOverlap[trade.play_type] = { count: 0, assets: new Set() };
            }
            playTypeOverlap[trade.play_type].count++;
            playTypeOverlap[trade.play_type].assets.add(asset);
          }
        });
      });
    });

    return {
      assetOverlap,
      brainPairs,
      riskAssets: riskAssets.sort((a, b) => b.brainCount - a.brainCount),
      playTypeOverlap,
    };
  }, [trades]);

  // Build correlation matrix
  const brainIds = BRAINS.map(b => b.id);
  const correlationMatrix = useMemo(() => {
    const matrix = {};
    brainIds.forEach(bid => {
      matrix[bid] = {};
      brainIds.forEach(bid2 => {
        if (bid === bid2) {
          matrix[bid][bid2] = 1;
        } else {
          const pair = [bid, bid2].sort().join('-');
          const overlap = analysis.brainPairs[pair]?.overlap || 0;
          const maxOverlap = Math.max(...Object.values(analysis.brainPairs).map(b => b.overlap || 0), 1);
          matrix[bid][bid2] = overlap / maxOverlap;
        }
      });
    });
    return matrix;
  }, [analysis.brainPairs]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <div className="text-[8px] text-[#6b6860] tracking-widest">COMPUTING CORRELATIONS...</div>
      </div>
    );
  }

  const topRiskAssets = analysis.riskAssets.slice(0, 10);
  const selectedAssetData = selectedAsset ? analysis.assetOverlap[selectedAsset] : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <h1 className="text-base font-black tracking-widest text-[#FFB81C]">CORRELATION MAP</h1>
        <div className="text-[8px] text-[#6b6860]">Strategy Overlap · Asset Concentration · Portfolio Risk</div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* View Toggle */}
        <div className="flex gap-1.5">
          {[
            { id: 'assets', label: 'ASSET OVERLAP' },
            { id: 'strategies', label: 'BRAIN CORRELATION' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className="flex-1 py-1.5 text-[7px] font-bold tracking-widest rounded transition-all"
              style={{
                background: viewMode === v.id ? '#FFB81C15' : 'transparent',
                color: viewMode === v.id ? '#FFB81C' : '#444',
                border: `1px solid ${viewMode === v.id ? '#FFB81C40' : '#1a1a1a'}`,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Asset Overlap View */}
        {viewMode === 'assets' && (
          <>
            {/* Concentration Warning */}
            {topRiskAssets.length > 0 && (
              <div className="bg-[#ef444415] border border-[#ef444430] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">⚠</span>
                  <span className="text-[8px] font-bold tracking-widest text-[#ef4444]">CONCENTRATION RISK</span>
                </div>
                <div className="text-[7px] text-[#d4d0c8]">
                  {topRiskAssets.length} asset(s) are trading across multiple brains, increasing portfolio risk
                </div>
              </div>
            )}

            {/* Top Risk Assets Grid */}
            <div className="space-y-2">
              <div className="text-[8px] font-bold tracking-widest text-[#6b6860]">MULTI-BRAIN ASSETS (RISK)</div>
              {topRiskAssets.length === 0 ? (
                <div className="text-center py-8 text-[8px] text-[#333]">No overlapping assets yet</div>
              ) : (
                <div className="space-y-1.5">
                  {topRiskAssets.map(({ asset, brainCount, brains }) => {
                    const isSelected = selectedAsset === asset;
                    return (
                      <button
                        key={asset}
                        onClick={() => setSelectedAsset(isSelected ? null : asset)}
                        className="w-full text-left bg-[#0d0d0d] border rounded-lg p-2.5 transition-all"
                        style={{ borderColor: isSelected ? '#ef444450' : '#1a1a1a' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="mono font-black text-sm text-[#d4d0c8]">{asset}</span>
                          <span className="px-1.5 py-0.5 rounded text-[6px] font-bold text-[#ef4444] bg-[#ef444415]">
                            {brainCount} BRAINS
                          </span>
                        </div>

                        {isSelected && (
                          <div className="pt-2 border-t border-[#111] space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {brains.map(bid => {
                                const brain = BRAINS.find(b => b.id === bid);
                                const assetTrades = analysis.assetOverlap[asset].trades.filter(t => t.brain_id === bid);
                                return (
                                  <div
                                    key={bid}
                                    className="flex items-center gap-1 px-1.5 py-1 rounded text-[6px] font-bold"
                                    style={{ background: brain?.color + '18', color: brain?.color }}
                                  >
                                    <span>{brain?.icon}</span>
                                    <span>{brain?.name}</span>
                                    <span className="text-[#4a4a44]">({assetTrades.length})</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Detailed Trades */}
                            <div>
                              <div className="text-[6px] text-[#4a4a44] tracking-widest mb-1">TRADES ON {asset}</div>
                              <div className="space-y-0.5">
                                {analysis.assetOverlap[asset].trades.map((trade, i) => {
                                  const brain = BRAINS.find(b => b.id === trade.brain_id);
                                  const pnlColor = trade.pnl && trade.pnl >= 0 ? '#22c55e' : '#ef4444';
                                  return (
                                    <div key={i} className="flex items-center gap-2 text-[6px]">
                                      <span style={{ color: brain?.color }}>{brain?.icon}</span>
                                      <span className="text-[#4a4a44]">
                                        {trade.action} @ ${trade.entry_price?.toFixed(2)}
                                      </span>
                                      {trade.pnl != null && (
                                        <span style={{ color: pnlColor }} className="font-bold">
                                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Brain Correlation Matrix */}
        {viewMode === 'strategies' && (
          <>
            {/* Correlation Heatmap */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3 overflow-x-auto">
              <div className="text-[7px] text-[#3a3a3a] tracking-widest mb-2">CORRELATION MATRIX (SHARED ASSETS)</div>
              <div className="inline-block min-w-full">
                <table className="text-[6px] border-collapse">
                  <thead>
                    <tr>
                      <td className="w-8 h-6" />
                      {brainIds.map(bid => {
                        const brain = BRAINS.find(b => b.id === bid);
                        return (
                          <th
                            key={bid}
                            className="w-12 h-6 text-center text-[5px] font-bold"
                            style={{ color: brain?.color }}
                          >
                            {brain?.icon}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {brainIds.map(bid1 => {
                      const brain1 = BRAINS.find(b => b.id === bid1);
                      return (
                        <tr key={bid1}>
                          <td
                            className="text-[5px] font-bold px-1 text-center"
                            style={{ color: brain1?.color }}
                          >
                            {brain1?.icon}
                          </td>
                          {brainIds.map(bid2 => {
                            const corr = correlationMatrix[bid1][bid2];
                            const intensity = Math.floor(corr * 255);
                            const color = corr === 1 ? 'transparent' : `rgba(255, 184, 28, ${corr * 0.5})`;
                            return (
                              <td
                                key={bid2}
                                className="w-12 h-6 border border-[#111] text-[5px] text-center font-bold text-[#d4d0c8]"
                                style={{ background: color }}
                              >
                                {corr === 1 ? '●' : corr > 0 ? Math.round(corr * 100) : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-[6px] text-[#4a4a44] mt-2">● = same brain · numbers = % overlap</div>
            </div>

            {/* Brain Pair Overlap */}
            <div className="space-y-2">
              <div className="text-[8px] font-bold tracking-widest text-[#6b6860]">BRAIN PAIR OVERLAPS</div>
              {Object.entries(analysis.brainPairs)
                .sort((a, b) => b[1].overlap - a[1].overlap)
                .slice(0, 8)
                .map(([pair, { overlap, assets }]) => {
                  const [bid1, bid2] = pair.split('-');
                  const brain1 = BRAINS.find(b => b.id === bid1);
                  const brain2 = BRAINS.find(b => b.id === bid2);
                  return (
                    <div key={pair} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{brain1?.icon}</span>
                          <span className="text-[8px] font-bold" style={{ color: brain1?.color }}>
                            {brain1?.name}
                          </span>
                          <span className="text-[#3a3a3a]">↔</span>
                          <span className="text-sm">{brain2?.icon}</span>
                          <span className="text-[8px] font-bold" style={{ color: brain2?.color }}>
                            {brain2?.name}
                          </span>
                        </div>
                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-[#FFB81C15] text-[#FFB81C]">
                          {overlap} ASSETS
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {assets.map(asset => (
                          <span key={asset} className="text-[6px] px-1 py-0.5 rounded bg-[#111] text-[#7a7a74]">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* Strategy Distribution */}
        <div className="space-y-2">
          <div className="text-[8px] font-bold tracking-widest text-[#6b6860]">PLAY TYPE CONCENTRATION</div>
          {Object.entries(analysis.playTypeOverlap)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 6)
            .map(([playType, { count, assets }]) => {
              const assetCount = assets.size;
              const concentration = assetCount > 1 ? 'Medium Risk' : 'Low Risk';
              const riskColor = assetCount > 2 ? '#ef4444' : assetCount > 1 ? '#FFB81C' : '#22c55e';
              return (
                <div key={playType} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-bold tracking-widest capitalize">{playType.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] px-1 py-0.5 rounded" style={{ background: riskColor + '15', color: riskColor }}>
                        {count} trades
                      </span>
                      <span className="text-[7px] text-[#4a4a44]">{assetCount} asset(s)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(assets).map(asset => (
                      <span key={asset} className="text-[6px] px-1 py-0.5 rounded bg-[#111] text-[#7a7a74]">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}