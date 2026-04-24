import { getBrainStats } from '../../../lib/performanceData';
import { useMemo } from 'react';

export default function BrainMetricCard({ brain, history, metric }) {
  const stats = useMemo(() => {
    if (!history) return null;
    const last = history[history.length - 1];
    const maxDD = Math.max(...history.map(d => d.drawdown));
    const avgSharpe = history.slice(-30).reduce((s, d) => s + d.sharpe, 0) / 30;
    return {
      roi: last.roi,
      maxDrawdown: parseFloat(maxDD.toFixed(2)),
      currentSharpe: parseFloat(last.sharpe.toFixed(2)),
      avgSharpe30d: parseFloat(avgSharpe.toFixed(2)),
    };
  }, [history]);

  if (!stats) return null;

  const { color, icon, name, focus } = brain;
  const winRate = brain.totalTrades > 0
    ? ((brain.wonTrades / brain.totalTrades) * 100).toFixed(1)
    : "0.0";

  const primaryValue = metric === "roi"
    ? { label: "TOTAL ROI", value: `${stats.roi >= 0 ? "+" : ""}${stats.roi.toFixed(1)}%`, color: stats.roi >= 0 ? "#22c55e" : "#ef4444" }
    : metric === "drawdown"
    ? { label: "MAX DRAWDOWN", value: `-${stats.maxDrawdown.toFixed(1)}%`, color: "#ef4444" }
    : { label: "SHARPE (30D)", value: stats.currentSharpe.toFixed(2), color: stats.currentSharpe >= 2 ? "#FFB81C" : stats.currentSharpe >= 1 ? "#22c55e" : "#ef4444" };

  const secondaryStats = metric === "roi"
    ? [
        { label: "WIN RATE", value: `${winRate}%` },
        { label: "TRADES", value: brain.totalTrades },
        { label: "P&L", value: `+$${brain.totalPnl.toFixed(0)}` },
      ]
    : metric === "drawdown"
    ? [
        { label: "CURRENT DD", value: `-${(history[history.length - 1]?.drawdown ?? 0).toFixed(1)}%` },
        { label: "RISK SCORE", value: `${(brain.riskTolerance * 100).toFixed(0)}%` },
        { label: "WIN RATE", value: `${winRate}%` },
      ]
    : [
        { label: "AVG SHARPE", value: stats.avgSharpe30d.toFixed(2) },
        { label: "WIN RATE", value: `${winRate}%` },
        { label: "RISK", value: `${(brain.riskTolerance * 100).toFixed(0)}%` },
      ];

  const sharpeRating = (s) => {
    if (s >= 2) return { label: "EXCELLENT", color: "#FFB81C" };
    if (s >= 1) return { label: "GOOD", color: "#22c55e" };
    if (s >= 0) return { label: "FAIR", color: "#f59e0b" };
    return { label: "POOR", color: "#ef4444" };
  };

  return (
    <div className="bg-[#0d0d0d] border rounded-xl px-3 py-3 flex items-center gap-3"
      style={{ borderColor: color + "30" }}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: color + "15", border: `1px solid ${color}30` }}>
        {icon}
      </div>

      {/* Name */}
      <div className="min-w-0 w-20 flex-shrink-0">
        <div className="text-[9px] font-black tracking-widest truncate" style={{ color }}>{name}</div>
        <div className="text-[7px] text-[#4a4a44]">{focus}</div>
        {metric === "sharpe" && (
          <div className="text-[6px] font-bold mt-0.5" style={{ color: sharpeRating(stats.currentSharpe).color }}>
            {sharpeRating(stats.currentSharpe).label}
          </div>
        )}
      </div>

      {/* Primary metric */}
      <div className="flex-shrink-0 text-center">
        <div className="mono text-sm font-black" style={{ color: primaryValue.color }}>{primaryValue.value}</div>
        <div className="text-[6px] text-[#3a3a3a] tracking-widest">{primaryValue.label}</div>
      </div>

      {/* Secondary stats */}
      <div className="flex gap-2 ml-auto">
        {secondaryStats.map(s => (
          <div key={s.label} className="text-center">
            <div className="mono text-[9px] font-bold text-[#c4c0b8]">{s.value}</div>
            <div className="text-[6px] text-[#3a3a3a]">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}