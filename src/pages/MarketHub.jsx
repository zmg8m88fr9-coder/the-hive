import { Link } from 'react-router-dom';
import { AGENT_LIST } from '../lib/marketAgents';

export default function MarketHub() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#FFB81C]">MARKET GRAPHS</h1>
            <div className="text-[8px] text-[#6b6860]">7 live graph retrieval agents · all asset classes</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e] font-bold tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Subtitle */}
        <div className="text-[8px] text-[#4a4a44] leading-relaxed pb-1">
          Each agent pulls live or near-live charts from verified sources. Select an asset class below to open its dedicated graph retrieval agent.
        </div>

        {/* Agent cards */}
        {AGENT_LIST.map(agent => (
          <Link key={agent.id} to={agent.path}>
            <div className="bg-[#0d0d0d] border rounded-xl p-3.5 mb-3 active:opacity-80 transition-opacity"
              style={{ borderColor: agent.color + '25' }}>
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: agent.color + '15', border: `1px solid ${agent.color}30` }}>
                  {agent.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black tracking-widest" style={{ color: agent.color }}>
                      {agent.name}
                    </span>
                    <span className="text-[7px] px-1.5 py-0.5 rounded font-bold tracking-widest"
                      style={{ background: agent.color + '20', color: agent.color, border: `1px solid ${agent.color}40` }}>
                      {agent.label}
                    </span>
                  </div>
                  <div className="text-[8px] text-[#6a6a64] leading-snug mb-2">{agent.tagline}</div>

                  {/* Watchlist preview */}
                  <div className="flex gap-1 flex-wrap">
                    {agent.watchlist.slice(0, 5).map(item => (
                      <span key={item.tv}
                        className="text-[7px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: '#111', color: '#4a4a44', border: '1px solid #1e1e1e' }}>
                        {item.label}
                      </span>
                    ))}
                    {agent.watchlist.length > 5 && (
                      <span className="text-[7px] px-1.5 py-0.5 rounded"
                        style={{ color: '#4a4a44' }}>
                        +{agent.watchlist.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-[#333] text-sm flex-shrink-0 mt-1">→</div>
              </div>

              {/* Bottom row: data info */}
              <div className="mt-3 pt-2.5 border-t flex items-center justify-between" style={{ borderColor: agent.color + '15' }}>
                <span className="text-[7px] text-[#4a4a44]">{agent.source.split('/')[0].trim()}</span>
                <span className="text-[7px] font-bold" style={{ color: agent.color + 'aa' }}>
                  {agent.reliability}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Source note */}
        <div className="text-[7px] text-[#333] leading-relaxed pt-1">
          Data delivered via TradingView embedded widgets. Free plan = 15-min delayed on stocks/ETFs. Crypto, forex, and futures may be near real-time depending on the exchange feed. Always verify timestamps before trading.
        </div>
      </div>
    </div>
  );
}
