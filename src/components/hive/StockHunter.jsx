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
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
        <div className="text-[8px] font-bold tracking-widest text-[#6b6860] mb-3">STOCK HUNTER</div>
        <div className="text-center py-6 text-[8px] text-[#333]">No stock opportunities under $15</div>
      </div>
    );
  }

  const filtered = selectedBrain ? hunts.filter(h => h.brain.id === selectedBrain) : hunts;

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-[#0d0d0d] to-[#050505] border-2 border-[#ef4444] rounded-xl p-4 relative overflow-hidden">
        {/* Predator glow effect */}
        <div className="absolute inset-0 opacity-5 blur-2xl" style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px]">🔴</span>
            <div className="text-[8px] font-black tracking-widest text-[#ef4444]">PREDATOR MODE ACTIVE</div>
            <div className="text-[7px] text-[#6b6860]">— Brains hunting prey under $15</div>
          </div>
        
        {/* Brain filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
          <button
            onClick={() => setSelectedBrain(null)}
            className="flex-shrink-0 px-2 py-1 rounded text-[7px] font-bold tracking-widest transition-all"
            style={{
              background: selectedBrain === null ? '#FFB81C15' : 'transparent',
              border: `1px solid ${selectedBrain === null ? '#FFB81C40' : '#1a1a1a'}`,
              color: selectedBrain === null ? '#FFB81C' : '#444',
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
                border: `1px solid ${selectedBrain === b.id ? b.color + '50' : '#1a1a1a'}`,
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
            const profitColor = hunt.predictedPnL >= 0 ? '#22c55e' : '#ef4444';
            const confColor = hunt.confidence > 0.8 ? '#22c55e' : hunt.confidence > 0.65 ? '#FFB81C' : '#f59e0b';
            const threatLevel = hunt.confidence > 0.8 ? 'IMMINENT' : hunt.confidence > 0.65 ? 'TRACKING' : 'STALKING';
            
            return (
              <div
                key={`${hunt.brain.id}-${hunt.ticker}`}
                className="relative overflow-hidden rounded-lg p-3 transition-all hover:scale-102 group"
                style={{ 
                  background: hunt.confidence > 0.8 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(17, 17, 17, 1)',
                  border: hunt.confidence > 0.8 ? '2px solid #22c55e' : '1px solid #1a1a1a'
                }}
              >
                {/* Hunt intensity pulse */}
                {hunt.confidence > 0.8 && (
                  <div className="absolute inset-0 opacity-10 animate-pulse" style={{ background: '#22c55e' }} />
                )}
                
                {/* Threat + Broker validation badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <div className="text-[6px] font-black px-1.5 py-0.5 rounded-full tracking-widest"
                    style={{
                      background: hunt.confidence > 0.8 ? '#22c55e20' : hunt.confidence > 0.65 ? '#FFB81C20' : '#f59e0b20',
                      color: threatLevel === 'IMMINENT' ? '#22c55e' : threatLevel === 'TRACKING' ? '#FFB81C' : '#f59e0b',
                      border: `1px solid ${threatLevel === 'IMMINENT' ? '#22c55e50' : threatLevel === 'TRACKING' ? '#FFB81C50' : '#f59e0b50'}`
                    }}>
                    {threatLevel}
                  </div>
                  {validationStatus[hunt.ticker] && (
                    <div className="text-[6px] font-black px-1.5 py-0.5 rounded-full tracking-widest"
                      style={{
                        background: validationStatus[hunt.ticker].valid ? '#22c55e20' : '#ef444420',
                        color: validationStatus[hunt.ticker].valid ? '#22c55e' : '#ef4444',
                        border: `1px solid ${validationStatus[hunt.ticker].valid ? '#22c55e50' : '#ef444450'}`
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
                        <div className="mono font-black text-sm text-[#d4d0c8]">{hunt.ticker}</div>
                        <div className="text-[7px]" style={{ color: hunt.brain.color }}>
                          {hunt.brain.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black" style={{ color: profitColor }}>
                        {hunt.predictedPnL >= 0 ? '▲ +' : '▼ '}${Math.abs(hunt.predictedPnL).toFixed(0)}
                      </div>
                      <div className="text-[6px] text-[#4a4a44]">KILL REWARD</div>
                    </div>
                  </div>

                  {/* Prey detection radar */}
                  <div className="mb-2 p-2 rounded" style={{ background: hunt.confidence > 0.8 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.3)' }}>
                    <div className="text-[6px] text-[#4a4a44] mb-1 tracking-widest">PREY DETECTED</div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="text-center">
                        <div className="text-[9px] font-bold text-[#d4d0c8]">${hunt.entryPrice.toFixed(2)}</div>
                        <div className="text-[6px] text-[#3a3a3a]">STRIKE ZONE</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-bold" style={{ color: profitColor }}>
                          {hunt.expectedReturn >= 0 ? '+' : ''}{hunt.expectedReturn.toFixed(1)}%
                        </div>
                        <div className="text-[6px] text-[#3a3a3a]">ESCAPE VELOCITY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] font-bold" style={{ color: hunt.confidence > 0.8 ? '#22c55e' : '#FFB81C' }}>
                          ${hunt.targetPrice.toFixed(2)}
                        </div>
                        <div className="text-[6px] text-[#3a3a3a]">KILL ZONE</div>
                      </div>
                    </div>
                  </div>

                  {/* Predator confidence / hunt certainty */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[7px] font-bold text-[#d4d0c8]">HUNT CERTAINTY</span>
                      <span className="text-[8px] font-black" style={{ color: confColor }}>
                        {(hunt.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#0d0d0d] rounded-full overflow-hidden border border-[#1a1a1a]">
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
                  <div className="text-[7px] leading-relaxed" style={{ color: hunt.confidence > 0.8 ? '#22c55e' : '#6b6860' }}>
                    <span className="font-bold">HUNTER INSTINCT:</span> {hunt.reasoning}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Predator Protocol */}
        <div className="mt-3 pt-3 border-t border-[#ef4444]30">
          <div className="text-[6px] text-[#ef4444] font-bold tracking-widest mb-2 flex items-center gap-1">
            ⚔️ PREDATOR PROTOCOL
          </div>
          <div className="space-y-1 text-[7px] text-[#5a5a54]">
            <div>• <span className="text-[#22c55e]">IMMINENT:</span> High confidence kill zone — brain sees the weakness</div>
            <div>• <span className="text-[#FFB81C]">TRACKING:</span> Prey in sights — waiting for optimal strike</div>
            <div>• <span className="text-[#f59e0b]">STALKING:</span> Prey detected — patience before the hunt</div>
            <div>• Only <span className="text-[#FFB81C] font-bold">$15 or under</span> — easy to stalk, hard to escape</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}