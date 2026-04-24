import { useState, useMemo } from 'react';
import { BRAINS } from '../lib/hiveData';
import { generatePerformanceHistory } from '../lib/performanceData';
import RoiChart from '../components/hive/perf/RoiChart';
import DrawdownChart from '../components/hive/perf/DrawdownChart';
import SharpeChart from '../components/hive/perf/SharpeChart';
import BrainMetricCard from '../components/hive/perf/BrainMetricCard';

const METRICS = [
  { id: "roi",      label: "CUMULATIVE ROI" },
  { id: "drawdown", label: "DRAWDOWN"       },
  { id: "sharpe",   label: "SHARPE RATIO"  },
];

export default function PerformanceDashboard() {
  const [activeMetric, setActiveMetric] = useState("roi");
  const [selectedBrains, setSelectedBrains] = useState(new Set(BRAINS.map(b => b.id)));

  const history = useMemo(() => generatePerformanceHistory(), []);

  const toggleBrain = (id) => {
    setSelectedBrains(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeBrains = BRAINS.filter(b => selectedBrains.has(b.id));

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#FFB81C]">PERFORMANCE</h1>
            <div className="text-[8px] text-[#6b6860]">Brain analytics · ROI · Drawdown · Sharpe</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[8px] text-[#22c55e]">LIVE</span>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="flex gap-1">
          {METRICS.map(m => (
            <button key={m.id} onClick={() => setActiveMetric(m.id)}
              className="flex-1 py-1.5 text-[7px] font-bold tracking-widest rounded transition-all"
              style={{
                background: activeMetric === m.id ? "#FFB81C15" : "transparent",
                color: activeMetric === m.id ? "#FFB81C" : "#444",
                border: `1px solid ${activeMetric === m.id ? "#FFB81C40" : "#1a1a1a"}`,
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Brain Filter Toggles */}
        <div className="flex gap-1.5 flex-wrap">
          {BRAINS.map(b => {
            const on = selectedBrains.has(b.id);
            return (
              <button key={b.id} onClick={() => toggleBrain(b.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                style={{
                  background: on ? b.color + "20" : "#0d0d0d",
                  border: `1px solid ${on ? b.color + "60" : "#1a1a1a"}`,
                  color: on ? b.color : "#333",
                }}>
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Chart */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-3">
          {activeMetric === "roi" && <RoiChart history={history} brains={activeBrains} />}
          {activeMetric === "drawdown" && <DrawdownChart history={history} brains={activeBrains} />}
          {activeMetric === "sharpe" && <SharpeChart history={history} brains={activeBrains} />}
        </div>

        {/* Per-Brain Metric Cards */}
        <div>
          <div className="text-[8px] font-bold tracking-widest text-[#6b6860] mb-2">BRAIN BREAKDOWN</div>
          <div className="space-y-2">
            {activeBrains.map(b => (
              <BrainMetricCard key={b.id} brain={b} history={history[b.id]} metric={activeMetric} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}