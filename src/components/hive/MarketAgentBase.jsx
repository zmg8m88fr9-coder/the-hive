import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

function buildTVUrl(tvSymbol, interval) {
  const studies = [
    'RSI@tv-basicstudies',
    'MACD@tv-basicstudies',
    'Volume@tv-studiess',
  ].join('%1F');

  return (
    'https://s.tradingview.com/widgetembed/' +
    `?symbol=${encodeURIComponent(tvSymbol)}` +
    `&interval=${interval}` +
    '&hidesidetoolbar=0' +
    '&hidetoptoolbar=0' +
    '&saveimage=0' +
    '&toolbarbg=0d0d0d' +
    `&studies=${studies}` +
    '&theme=dark' +
    '&style=1' +
    '&timezone=exchange' +
    '&withdateranges=1' +
    '&showpopupbutton=0' +
    '&allow_symbol_change=1' +
    '&locale=en'
  );
}

function DataRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-[#1a1a1a] last:border-0">
      <span className="text-[8px] text-[#6b6860] tracking-widest flex-shrink-0 uppercase">{label}</span>
      <span className={`text-[8px] font-mono text-right break-all ${valueClass || 'text-[#d4d0c8]'}`}>{value}</span>
    </div>
  );
}

export default function MarketAgentBase({ config }) {
  const {
    color, icon, name, label, tagline, assetType,
    defaultInterval, watchlist, timeframes, indicators,
    source, dataDelay, reliability, links, summary,
  } = config;

  const [selected, setSelected] = useState(watchlist[0]);
  const [interval, setIntervalVal] = useState(defaultInterval);
  const [customInput, setCustomInput] = useState('');

  const tvUrl = useMemo(
    () => buildTVUrl(selected.tv, interval),
    [selected.tv, interval]
  );

  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  function handleCustomSubmit(e) {
    e.preventDefault();
    const raw = customInput.trim().toUpperCase();
    if (!raw) return;
    setSelected({ symbol: raw, tv: raw, label: raw });
    setCustomInput('');
  }

  const tvChartLink = links?.tv?.(selected.symbol) ?? `https://www.tradingview.com/chart/?symbol=${selected.tv}`;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/market">
            <span className="text-[#6b6860] text-sm leading-none">←</span>
          </Link>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest" style={{ color }}>{name}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-widest"
                style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
                {label}
              </span>
            </div>
            <div className="text-[8px] text-[#6b6860] truncate">{tagline}</div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
            <span className="text-[8px] font-bold tracking-widest" style={{ color }}>LIVE</span>
          </div>
        </div>

        {/* Watchlist pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {watchlist.map(item => {
            const active = selected.tv === item.tv;
            return (
              <button key={item.tv} onClick={() => setSelected(item)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: color + '25', border: `1px solid ${color}60`, color }
                  : { background: 'transparent', border: '1px solid #222', color: '#6b6860' }}>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* Timeframe + custom ticker row */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-shrink-0">
            {timeframes.map(tf => (
              <button key={tf.value} onClick={() => setIntervalVal(tf.value)}
                className="px-2 py-1 rounded text-[8px] font-bold transition-all"
                style={interval === tf.value
                  ? { background: color + '25', color, border: `1px solid ${color}50` }
                  : { background: '#0d0d0d', color: '#6b6860', border: '1px solid #1a1a1a' }}>
                {tf.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-1 flex-1 min-w-0">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Custom symbol…"
              className="flex-1 min-w-0 px-2 py-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded text-[8px] text-[#d4d0c8] placeholder-[#444] outline-none focus:border-[#333]"
            />
            <button type="submit"
              className="px-2 py-1 rounded text-[8px] font-bold flex-shrink-0"
              style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
              GO
            </button>
          </form>
        </div>

        {/* TradingView chart */}
        <div className="rounded-xl overflow-hidden border border-[#1a1a1a]" style={{ height: 340 }}>
          <iframe
            key={`${selected.tv}-${interval}`}
            src={tvUrl}
            title={`${selected.symbol} chart`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowTransparency
            scrolling="no"
            style={{ display: 'block' }}
          />
        </div>

        {/* Output card — structured agent output format */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3 space-y-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-black tracking-widest" style={{ color }}>
              AGENT OUTPUT
            </span>
            <a href={tvChartLink} target="_blank" rel="noopener noreferrer"
              className="text-[7px] px-2 py-0.5 rounded font-bold tracking-widest"
              style={{ background: color + '15', color, border: `1px solid ${color}30` }}>
              OPEN CHART ↗
            </a>
          </div>

          <DataRow label="Ticker"       value={selected.symbol} valueClass="font-black text-[#d4d0c8]" />
          <DataRow label="Asset Type"   value={assetType} />
          <DataRow label="Source"       value={source} />
          <DataRow label="Chart Link"   value={
            <a href={tvChartLink} target="_blank" rel="noopener noreferrer"
              className="underline" style={{ color }}>
              tradingview.com ↗
            </a>
          } />
          <DataRow label="Timeframe"    value={timeframes.find(t => t.value === interval)?.label ?? interval} />
          <DataRow label="Timestamp"    value={timestamp} />
          <DataRow label="Live/Delayed" value={dataDelay}
            valueClass={dataDelay.toLowerCase().includes('real') ? 'text-[#22c55e]' : 'text-[#f59e0b]'} />
          <DataRow label="Current Price" value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Move %"        value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Volume"        value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Rel. Volume"   value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Trend"         value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Support"       value="See chart →" valueClass="text-[#6b6860] italic" />
          <DataRow label="Resistance"    value="See chart →" valueClass="text-[#6b6860] italic" />
        </div>

        {/* Indicators */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          <div className="text-[8px] font-black tracking-widest mb-2" style={{ color }}>INDICATORS</div>
          <div className="flex flex-wrap gap-1.5">
            {indicators.map(ind => (
              <span key={ind} className="text-[7px] px-2 py-0.5 rounded font-bold"
                style={{ background: color + '12', color: color + 'cc', border: `1px solid ${color}25` }}>
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          <div className="text-[8px] font-black tracking-widest mb-2" style={{ color }}>SUMMARY</div>
          <p className="text-[8px] text-[#9a9890] leading-relaxed">{summary}</p>
        </div>

        {/* Reliability + links */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-black tracking-widest" style={{ color }}>RELIABILITY</span>
            <span className="text-[8px] font-bold" style={{ color }}>{reliability}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(links ?? {}).map(([site, fn]) => (
              <a key={site} href={fn(selected.symbol)} target="_blank" rel="noopener noreferrer"
                className="text-[7px] px-2 py-0.5 rounded font-bold tracking-widest uppercase"
                style={{ background: '#111', color: '#6b6860', border: '1px solid #222' }}>
                {site} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
