// Always use 200 as internal coordinate width, scale via SVG viewBox
export default function SparkLine({ data = [], width = "100%", height = 28, color = "#FFB81C", showDot = true }) {
  const CW = 200; // internal coordinate width
  const CH = height;

  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <line x1="0" y1={CH/2} x2={CW} y2={CH/2} stroke="#333" strokeWidth="1" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const usableH = CH - pad * 2;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * CW;
    const y = pad + (1 - (v - min) / range) * usableH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const lastIdx = data.length - 1;
  const lastX = (lastIdx / (data.length - 1)) * CW;
  const lastY = pad + (1 - (data[lastIdx] - min) / range) * usableH;
  const areaPath = `M0,${CH} L${pts.split(" ").join(" L")} L${CW},${CH} Z`;
  const gradId = `grad-${color.replace("#", "")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {showDot && <circle cx={lastX} cy={lastY} r={3} fill={color} />}
    </svg>
  );
}