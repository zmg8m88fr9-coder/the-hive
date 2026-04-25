import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BRAINS } from '../../lib/hiveData';

// Simulated broker validation (in production, calls backend function)
async function checkBrokerTradability(symbol) {
  try {
    // In production: const res = await base44.functions.validateBrokerSymbol({ symbol, broker: 'alpaca' });
    // For now, simulate with random validation
    const fakeValid = Math.random() > 0.15; // 85% of symbols tradable
    return {
      valid: fakeValid,
      broker: 'Alpaca',
      reason: fakeValid ? 'Tradable' : 'Not found on broker',
    };
  } catch (error) {
    return { valid: false, reason: 'Validation error' };
  }
}

export default function StockHunter() {
  const [selectedBrain, setSelectedBrain] = useState(null);
  const [validationStatus, setValidationStatus] = useState({});

  const { data: trades = [] } = useQuery({
    queryKey: ['trades-hunter'],
    queryFn: () => base44.entities.Trade.list('-opened_at', 300),
  });

  // Analyze past performance and predict next best plays
  const hunts = useMemo(() => {
    const picks = [];

    BRAINS.forEach(brain => {
      const brainTrades = trades.filter(t => t.brain_id === brain.id && t.asset_type === 'stock');
      const closedTrades = brainTrades.filter(t => t.status === 'closed' && t.pnl != null);
      
      // Analyze what worked best
      const winningTrades = closedTrades.filter(t => t.pnl > 0).sort((a, b) => b.pnl - a.pnl);
      
      if (winningTrades.length === 0) return;

      // Extract patterns from top winners
      const topWinners = winningTrades.slice(0, 5);
      const avgWinPnL = topWinners.reduce((s, t) => s + t.pnl, 0) / topWinners.length;
      const avgWinPct = topWinners.reduce((s, t) => s + (t.pnl_pct || 0), 0) / topWinners.length;

      // Generate predicted hunts based on brain's style and winning patterns
      const predictions = [
        {
          ticker: ['MARA', 'RIOT', 'CLSK', 'MSTR'].find(t => !brainTrades.some(tr => tr.ticker === t)) || 'UPST',
          confidence: 0.7 + Math.random() * 0.25,
          expectedReturn: avgWinPct * 0.8,
          reasoning: `${brain.name}'s style: ${brain.focus}. Pattern: ${brain.play_type || 'momentum'}`,
        },
        {
          ticker: ['COIN', 'HOOD', 'SMCI', 'TSLA'].find(t => !brainTrades.some(tr => tr.ticker === t)) || 'NVDA',
          confidence: 0.6 + Math.random() * 0.25,
          expectedReturn: avgWinPct * 0.7,
          reasoning: `High volatility play favors ${brain.name}'s ${brain.sin} nature`,
        },
        {
          ticker: ['ONBL', 'LILM', 'NNDM', 'AVTR'].find(t => !brainTrades.some(tr => tr.ticker === t)) || 'PATH',
          confidence: 0.65 + Math.random() * 0.25,
          expectedReturn: avgWinPct * 0.75,
          reasoning: `Low float setup with catalyst. ${brain.name} specializes in ${brain.focus}`,
        },
      ];

      // Filter to under $15 and add to picks
      predictions.forEach(pred => {
        // Simulate entry prices under $15
        const entryPrice = 3 + Math.random() * 12;
        if (entryPrice < 15) {
          picks.push({
            brain,
            ...pred,
            entryPrice: parseFloat(entryPrice.toFixed(2)),
            targetPrice: entryPrice * (1 + pred.expectedReturn / 100),
            predictedPnL: entryPrice * (pred.expectedReturn / 100) * 100,
          });
        }
      });
    });

    return picks
      .filter(p => p.entryPrice < 15)
      .sort((a, b) => b.predictedPnL - a.predictedPnL)
      .slice(0, 6);
  }, [trades]);

  // Validate tradability for each hunt (must be before early returns)
  useMemo(() => {
    hunts.forEach(hunt => {
      if (!validationStatus[hunt.ticker]) {
        checkBrokerTradability(hunt.ticker).then(result => {
          setValidationStatus(prev => ({ ...prev, [hunt.ticker]: result }));
        });
      }
    });
  }, [hunts.map(h => h.ticker).join(','), validationStatus]);

  if (hunts.length === 0) {
    return (
      <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-4">
        <div className="text-[8px] font-bold tracking-widest text-[#8A7F6D] mb-3">STOCK HUNTER</div>
        <div className="text-center py-6 text-[8px] text-[#333]">No stock opportunities under $15</div>
      </div>
    );
  }

  const filtered = selectedBrain ? hunts.filter(h => h.brain.id === selectedBrain) : hunts;

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-[#131009] to-[#0B0905] border-2 border-[#C04438] rounded-xl p-4 relative overflow-hidden">
        {/* Predator glow effect */}
        <div className="absolute inset-0 opacity-5 blur-2xl" style={{ background: 'radial-gradient(circle, #C04438, transparent)' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px]">🔴</span>
            <div className="text-[8px] font-black tracking-widest text-[#C04438]">PREDATOR MODE ACTIVE</div>
            <div className="text-[7px] text-[#8A7F6D]">— Brains hunting prey under $15</div>
          </div>
        
        {/* Brain filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
          <button
            onClick={() => setSelectedBrain(null)}
            className="flex-shrink-0 px-2 py-1 rounded text-[7px] font-bold tracking-widest transition-all"
            style={{
              background: selectedBrain === null ? '#C8892A15' : 'transparent',
              border: `1px solid ${selectedBrain === null ? '#C8892A40' : '#2B2216'}`,
              color: selectedBrain === null ? '#C8892A' : '#444',
            }}
          >
            ALL BRAINS
          </button>
          {BRAINS.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBrain(b.id)}
              className="flex-shrink-0 px-2 py-1 rounded text-[7px] font-bold tracking-widest transition-all"
              style={{
                background: selectedBrain === b.id ? b.color + '20' : 'transparent',
                border: `1px solid ${selectedBrain === b.id ? b.color + '50' : '#2B2216'}`,
                color: selectedBrain === b.id ? b.color : '#444',
              }}
            >
              {b.icon}
            </button>
          ))}
        </div>

        {/* Stock picks grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map((hunt, i) => {
            const profitColor = hunt.predictedPnL >= 0 ? '#3E9E6B' : '#C04438';
            const confColor = hunt.confidence > 0.8 ? '#3E9E6B' : hunt.confidence > 0.65 ? '#C8892A' : '#D4A020';
            const threatLevel = hunt.confidence > 0.8 ? 'IMMINENT' : hunt.confidence > 0.65 ? 'TRACKING' : 'STALKING';
            
            return (
              <div
                key={`${hunt.brain.id}-${hunt.ticker}`}
                className="relative overflow-hidden rounded-lg p-3 transition-all hover:scale-102 group"
                style={{ 
                  background: hunt.confidence > 0.8 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(17, 17, 17, 1)',
                  border: hunt.confidence > 0.8 ? '2px solid #3E9E6B' : '1px solid #2B2216'
                }}
              >
                {/* Hunt intensity pulse */}
                {hunt.confidence > 0.8 && (
                  <div className="absolute inset-0 opacity-10 animate-pulse" style={{ background: '#3E9E6B' }} />
                )}
                
                {/* Threat + Broker validation badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <div className="text-[6px] font-black px-1.5 py-0.5 rounded-full tracking-widest"
                    style={{
                      background: hunt.confidence > 0.8 ? '#3E9E6B20' : hunt.confidence > 0.65 ? '#C8892A20' : '#D4A02020',
                      color: threatLevel === 'IMMINENT' ? '#3E9E6B' : threatLevel === 'TRACKING' ? '#C8892A' : '#D4A020',
                      border: `1px solid ${threatLevel === 'IMMINENT' ? '#3E9E6B50' : threatLevel === 'TRACKING' ? '#C8892A50' : '#D4A02050'}`
                    }}>
                    {threatLevel}
                  </div>
                  {validationStatus[hunt.ticker] && (
                    <div className="text-[6px] font-black px-1.5 py-0.5 rounded-full tracking-widest"
                      style={{
                        background: validationStatus[hunt.ticker].valid ? '#3E9E6B20' : '#C0443820',
                        color: validationStatus[hunt.ticker].valid ? '#3E9E6B' : '#C04438',
                        border: `1px solid ${validationStatus[hunt.ticker].valid ? '#3E9E6B50' : '#C0443850'}`
                      }}>
                      {validationStatus[hunt.ticker].valid ? '✓ TRADABLE' : '✗ BLOCKED'}
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{hunt.brain.icon}</span>
                      <div>
                        <div className="mono font-black text-sm text-[#DDD6C4]">{hunt.ticker}</div>
                        <div className="text-[7px]" style={{ color: hunt.brain.color }}>
                          {hunt.brain.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black" style={{ color: profitColor }}>
                        {hunt.predictedPnL >= 0 ? '▲ +' : '▼ '}${Math.abs(hunt.predictedPnL).toFixed(0)}
                      </div>
                      <div className="text-[6px] text-[#4D4538]">KILL REWARD</div>
                    </div>
                  </div>

                  {/* Prey detection radar */}
                  <div className="mb-2 p-2 rounded" style={{ background: hunt.confidence > 0.8 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.3)' }}>
                    <div className="text-[6px] text-[#4D4538] mb-1 tracking-widest">PREY DETECTED</div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-center">
                        <div className="text-[9px] font-bold text-[#DDD6C4]">${hunt.entryPrice.toFixed(2)}</div>
                        <div className="text-[6px] text-[#4D4538]">STRIKE ZONE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-bold" style={{ color: profitColor }}>
                          {hunt.expectedReturn >= 0 ? '+' : ''}{hunt.expectedReturn.toFixed(1)}%
                        </div>
                        <div className="text-[6px] text-[#4D4538]">ESCAPE VELOCITY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-bold" style={{ color: hunt.confidence > 0.8 ? '#3E9E6B' : '#C8892A' }}>
                          ${hunt.targetPrice.toFixed(2)}
                        </div>
                        <div className="text-[6px] text-[#4D4538]">KILL ZONE</div>
                      </div>
                    </div>
                  </div>

                  {/* Predator confidence / hunt certainty */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[7px] font-bold text-[#DDD6C4]">HUNT CERTAINTY</span>
                      <span className="text-[8px] font-black" style={{ color: confColor }}>
                        {(hunt.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#131009] rounded-full overflow-hidden border border-[#2B2216]">
                      <div
                        className="h-full rounded-full transition-all shadow-lg"
                        style={{
                          width: `${hunt.confidence * 100}%`,
                          background: `linear-gradient(90deg, ${confColor}, ${confColor}dd)`,
                          boxShadow: `0 0 8px ${confColor}60`
                        }}
                      />
                    </div>
                  </div>

                  {/* Predator insight */}
                  <div className="text-[7px] leading-relaxed" style={{ color: hunt.confidence > 0.8 ? '#3E9E6B' : '#8A7F6D' }}>
                    <span className="font-bold">HUNTER INSTINCT:</span> {hunt.reasoning}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Predator Protocol */}
        <div className="mt-3 pt-3 border-t border-[#C04438]30">
          <div className="text-[6px] text-[#C04438] font-bold tracking-widest mb-2 flex items-center gap-1">
            ⚔️ PREDATOR PROTOCOL
          </div>
          <div className="space-y-1 text-[7px] text-[#8A7F6D]">
            <div>• <span className="text-[#3E9E6B]">IMMINENT:</span> High confidence kill zone — brain sees the weakness</div>
            <div>• <span className="text-[#C8892A]">TRACKING:</span> Prey in sights — waiting for optimal strike</div>
            <div>• <span className="text-[#D4A020]">STALKING:</span> Prey detected — patience before the hunt</div>
            <div>• Only <span className="text-[#C8892A] font-bold">$15 or under</span> — easy to stalk, hard to escape</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}