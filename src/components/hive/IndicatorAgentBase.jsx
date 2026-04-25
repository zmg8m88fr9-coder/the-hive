import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAINS } from '../../lib/hiveData';
import { toTVSymbol } from '../../lib/indicatorAgents';

const EXTERNAL_LINKS = {
  float:   (sym) => ({ finviz: `https://finviz.com/quote.ashx?t=${sym}`, yahoo: `https://finance.yahoo.com/quote/${sym}` }),
  options: (sym) => ({ cboe: `https://www.cboe.com/delayed_quotes/${sym}/options`, yahoo: `https://finance.yahoo.com/quote/${sym}/options`, barchart: `https://www.barchart.com/stocks/quotes/${sym}/options` }),
};

function buildTVUrl(tvSymbol, interval, studies, style) {
  const studyStr = studies.length ? studies.join('%1F') : '';
  return (
    'https://s.tradingview.com/widgetembed/' +
    `?symbol=${encodeURIComponent(tvSymbol)}` +
    `&interval=${interval}` +
    '&hidesidetoolbar=0&hidetoptoolbar=0&saveimage=0' +
    '&toolbarbg=0d0d0d' +
    (studyStr ? `&studies=${studyStr}` : '') +
    `&theme=dark&style=${style}` +
    '&timezone=exchange&withdateranges=1&showpopupbutton=0' +
    '&allow_symbol_change=1&locale=en'
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-[#1a1a1a] last:border-0">
      <span className="text-[7px] text-[#6b6860] tracking-widest uppercase flex-shrink-0">{label}</span>
      <span className={`text-[8px] font-mono text-right break-all ${accent || 'text-[#d4d0c8]'}`}>{value}</span>
    </div>
  );
}

export default function IndicatorAgentBase({ indicator }) {
  const {
    id, label, icon, color, description, tvStudies, tvStyle,
    defaultInterval, primaryBrains, timeframes, keySignals,
    dataDelay, reliability, outputFields, externalOnly,
    customWatchlist,
  } = indicator;

  // Brain selection — default to first primary brain if possible
  const defaultBrain = BRAINS.find(b => primaryBrains.includes(b.id)) || BRAINS[0];
  const [activeBrain, setActiveBrain] = useState(defaultBrain);
  const [interval, setIntervalVal] = useState(defaultInterval);
  const [customInput, setCustomInput] = useState('');

  // Watchlist: prefer indicator's custom watchlist, else brain's own
  const watchlist = useMemo(() => {
    if (customWatchlist) return customWatchlist;
    return (activeBrain.watchlist || []).map(sym => ({
      symbol: sym,
      tv: toTVSymbol(sym, activeBrain.focus),
      label: sym.replace('_F', '').replace('USD', '/USD').replace('EUR', 'EUR/').replace('GBP', 'GBP/'),
    }));
  }, [activeBrain, customWatchlist]);

  const [selected, setSelected] = useState(watchlist[0]);

  // Reset to first ticker when brain or watchlist changes
  useEffect(() => {
    setSelected(watchlist[0]);
  }, [activeBrain.id, customWatchlist]);

  const tvUrl = useMemo(
    () => buildTVUrl(selected.tv, interval, tvStudies, tvStyle),
    [selected.tv, interval, tvStudies, tvStyle]
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
    const tvSym = toTVSymbol(raw, activeBrain.focus);
    setSelected({ symbol: raw, tv: tvSym, label: raw });
    setCustomInput('');
  }

  const tvChartLink = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selected.tv)}`;
  const extLinks = EXTERNAL_LINKS[id]?.(selected.symbol) || {};

  // Timeframe options — map value → label
  const TF_LABELS = { '1':'1M','5':'5M','15':'15M','60':'1H','240':'4H','D':'D','W':'W','M':'M' };

  const isHighRelevance = primaryBrains.includes(activeBrain.id);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-2.5">
          <Link to="/indicators">
            <span className="text-[#6b6860] text-sm leading-none">←</span>
          </Link>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black tracking-widest" style={{ color }}>{label}</span>
              {!isHighRelevance && (
                <span className="text-[6px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#111', color: '#6b6860', border: '1px solid #222' }}>
                  LOW RELEVANCE FOR {activeBrain.name}
                </span>
              )}
            </div>
            <div className="text-[7px] text-[#6b6860] truncate">{description}</div>
          </div>
        </div>

        {/* Brain selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {BRAINS.map(brain => {
            const active = activeBrain.id === brain.id;
            const relevant = primaryBrains.includes(brain.id);
            return (
              <button key={brain.id} onClick={() => setActiveBrain(brain)}
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: brain.color + '25', border: `1px solid ${brain.color}60`, color: brain.color }
                  : { background: 'transparent', border: '1px solid #1e1e1e', color: relevant ? '#6b6860' : '#333' }}>
                <span>{brain.icon}</span>
                <span>{brain.name.replace('THE_', '').replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* Watchlist pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {watchlist.map(item => {
            const active = selected.tv === item.tv;
            return (
              <button key={item.tv} onClick={() => setSelected(item)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all"
                style={active
                  ? { background: activeBrain.color + '25', border: `1px solid ${activeBrain.color}60`, color: activeBrain.color }
                  : { background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#6b6860' }}>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Timeframe + custom input */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-shrink-0 flex-wrap">
            {timeframes.map(tf => (
              <button key={tf} onClick={() => setIntervalVal(tf)}
                className="px-2 py-1 rounded text-[7px] font-bold transition-all"
                style={interval === tf
                  ? { background: color + '25', color, border: `1px solid ${color}50` }
                  : { background: '#0d0d0d', color: '#6b6860', border: '1px solid #1a1a1a' }}>
                {TF_LABELS[tf] || tf}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-1 flex-1 min-w-0">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Custom symbol…"
              className="flex-1 min-w-0 px-2 py-1 bg-[#0d0d0d] border border-[#1a1a1a] rounded text-[8px] text-[#d4d0c8] placeholder-[#333] outline-none focus:border-[#2a2a2a]"
            />
            <button type="submit"
              className="px-2 py-1 rounded text-[8px] font-bold"
              style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
              GO
            </button>
          </form>
        </div>

        {/* Chart or external-only notice */}
        {externalOnly ? (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-[8px] font-bold tracking-widest mb-1" style={{ color }}>{label}</div>
            <div className="text-[7px] text-[#6b6860] mb-3">{description}</div>
            <div className="text-[7px] text-[#4a4a44]">This data is not charted via TradingView. Use the external links below.</div>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-[#1a1a1a]" style={{ height: 340 }}>
            <iframe
              key={`${selected.tv}-${interval}-${id}`}
              src={tvUrl}
              title={`${label} — ${selected.symbol}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency
              scrolling="no"
              style={{ display: 'block' }}
            />
          </div>
        )}

        {/* Agent output card */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[7px] font-black tracking-widest" style={{ color }}>AGENT OUTPUT</span>
            <a href={tvChartLink} target="_blank" rel="noopener noreferrer"
              className="text-[6px] px-2 py-0.5 rounded font-bold"
              style={{ background: color + '15', color, border: `1px solid ${color}30` }}>
              OPEN CHART ↗
            </a>
          </div>
          <Row label="Ticker"       value={selected.symbol} accent="font-black text-[#d4d0c8]" />
          <Row label="Indicator"    value={label} />
          <Row label="Brain"        value={`${activeBrain.icon} ${activeBrain.name}`} />
          <Row label="Asset Type"   value={activeBrain.focus} />
          <Row label="Timeframe"    value={TF_LABELS[interval] || interval} />
          <Row label="Timestamp"    value={timestamp} />
          <Row label="Live/Delayed" value={dataDelay}
            accent={dataDelay.toLowerCase().includes('real') ? 'text-[#22c55e]' : 'text-[#f59e0b]'} />
          {outputFields.map(f => (
            <Row key={f} label={f} value="See chart →" accent="text-[#6b6860] italic" />
          ))}
        </div>

        {/* Key signals */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          <div className="text-[7px] font-black tracking-widest mb-2" style={{ color }}>KEY SIGNALS</div>
          <div className="space-y-1.5">
            {keySignals.map((sig, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[7px] mt-0.5 flex-shrink-0" style={{ color }}>▸</span>
                <span className="text-[7px] text-[#9a9890] leading-relaxed">{sig}</span>
              </div>
            ))}
          </div>
        </div>

        {/* External links */}
        {(Object.keys(extLinks).length > 0 || !externalOnly) && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[7px] font-black tracking-widest" style={{ color }}>SOURCES</span>
              <span className="text-[6px] font-bold" style={{ color }}>{reliability}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <a href={tvChartLink} target="_blank" rel="noopener noreferrer"
                className="text-[6px] px-2 py-0.5 rounded font-bold uppercase"
                style={{ background: '#111', color: '#6b6860', border: '1px solid #222' }}>
                tradingview ↗
              </a>
              {Object.entries(extLinks).map(([site, url]) => (
                <a key={site} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-[6px] px-2 py-0.5 rounded font-bold uppercase"
                  style={{ background: '#111', color: '#6b6860', border: '1px solid #222' }}>
                  {site} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
