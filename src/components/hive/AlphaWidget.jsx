import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../../lib/hiveData';
import { Link } from 'react-router-dom';

// Simulated benchmark returns
const BENCHMARK_RETURNS = {
  sp500: 12.5, // 90-day return %
  btc: 18.3,   // 90-day return %
};

export default function AlphaWidget() {
  const { data: trades = [] } = useQuery({
    queryKey: ['trades-alpha-widget'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 150),
  });

  const alphaData = useMemo(() => {
    const metrics = BRAINS.map(brain => {
      const brainTrades = trades.filter(t => t.brain_id === brain.id);
      const closedTrades = brainTrades.filter(t => t.status === 'closed' && t.pnl != null);
      
      if (closedTrades.length === 0) {
        return { brain, return: 0, alphaSp500: -BENCHMARK_RETURNS.sp500, alphaBtc: -BENCHMARK_RETURNS.btc };
      }

      const totalPnL = closedTrades.reduce((s, t) => s + t.pnl, 0);
      const brainReturn = (totalPnL / 3000) * 100;
      
      return {
        brain,
        return: brainReturn,
        alphaSp500: brainReturn - BENCHMARK_RETURNS.sp500,
        alphaBtc: brainReturn - BENCHMARK_RETURNS.btc,
      };
    });

    return metrics.sort((a, b) => b.alphaSp500 - a.alphaSp500);
  }, [trades]);

  const topAlpha = alphaData[0];
  const avgAlpha = alphaData.reduce((s, m) => s + m.alphaSp500, 0) / alphaData.length;
  const beatingBenchmark = alphaData.filter(m => m.alphaSp500 > 0).length;

  return (
    <Link to="/alpha">
      <div className="bg-gradient-to-br from-[#131009] to-[#0B0905] border border-[#3A74D4] rounded-xl p-3.5 hover:border-[#3A74D450] transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold tracking-widest text-[#3A74D4]">ALPHA GENERATION</span>
            <span className="text-[6px] px-1.5 py-0.5 rounded bg-[#3A74D420] text-[#3A74D4]">vs S&P 500</span>
          </div>
          <span className="text-[8px] text-[#3A74D4]">→</span>
        </div>

        {/* Top performer */}
        {topAlpha && (
          <div className="mb-2.5 pb-2.5 border-b border-[#2B2216]">
            <div className="text-[6px] text-[#4D4538] tracking-widest mb-1">TOP ALPHA GENERATOR</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{topAlpha.brain.icon}</span>
                <div>
                  <div className="text-[8px] font-black" style={{ color: topAlpha.brain.color }}>
                    {topAlpha.brain.name}
                  </div>
                  <div className="text-[6px] text-[#4D4538]">{topAlpha.brain.focus}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black" style={{ color: topAlpha.alphaSp500 > 0 ? '#3E9E6B' : '#C04438' }}>
                  {topAlpha.alphaSp500 > 0 ? '+' : ''}{topAlpha.alphaSp500.toFixed(1)}%
                </div>
                <div className="text-[6px] text-[#4D4538]">Alpha</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-[#1A1510] rounded p-1.5 text-center">
            <div className="text-[8px] font-black text-[#3A74D4]">{beatingBenchmark}/6</div>
            <div className="text-[6px] text-[#4D4538]">Beat S&P</div>
          </div>
          <div className="bg-[#1A1510] rounded p-1.5 text-center">
            <div className="text-[8px] font-black" style={{ color: avgAlpha > 0 ? '#3E9E6B' : '#C04438' }}>
              {avgAlpha > 0 ? '+' : ''}{avgAlpha.toFixed(1)}%
            </div>
            <div className="text-[6px] text-[#4D4538]">Avg Alpha</div>
          </div>
          <div className="bg-[#1A1510] rounded p-1.5 text-center">
            <div className="text-[8px] font-black text-[#C8892A]">{BENCHMARK_RETURNS.sp500}%</div>
            <div className="text-[6px] text-[#4D4538]">Benchmark</div>
          </div>
        </div>
      </div>
    </Link>
  );
}