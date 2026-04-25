import { useState, useMemo } from 'react';
import { BRAINS } from '../lib/hiveData';
import { generatePerformanceHistory } from '../lib/performanceData';
import RoiChart from '../components/hive/perf/RoiChart';
import DrawdownChart from '../components/hive/perf/DrawdownChart';
import SharpeChart from '../components/hive/perf/SharpeChart';
import BrainMetricCard from '../components/hive/perf/BrainMetricCard';
import PnLDashboard from '../components/hive/perf/PnLDashboard';

const METRICS = [
  { id: "pnl",      label: "P&L"           },
  { id: "roi",      label: "ROI"           },
  { id: "drawdown", label: "DRAWDOWN"      },
  { id: "sharpe",   label: "SHARPE"        },
];

export default function PerformanceDashboard() {
  const [activeMetric, setActiveMetric] = useState("pnl");
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
      <div className="sticky top-0 z-10 bg-[#0B0905] border-b border-[#2B2216] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black tracking-widest text-[#C8892A]">PERFORMANCE</h1>
            <div className="text-[8px] text-[#8A7F6D]">Brain analytics · ROI · Drawdown · Sharpe</div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E9E6B] animate-pulse" />
            <span className="text-[8px] text-[#3E9E6B]">LIVE</span>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="flex gap-1">
          {METRICS.map(m => (
            <button key={m.id} onClick={() => setActiveMetric(m.id)}
              className="flex-1 py-1.5 text-[7px] font-bold tracking-widest rounded transition-all"
              style={{
                background: activeMetric === m.id ? "#C8892A15" : "transparent",
                color: activeMetric === m.id ? "#C8892A" : "#444",
                border: `1px solid ${activeMetric === m.id ? "#C8892A40" : "#2B2216"}`,
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* P&L Dashboard — has its own controls */}
        {activeMetric === "pnl" && <PnLDashboard />}

        {/* Other metrics — shared brain filter + charts */}
        {activeMetric !== "pnl" && (
          <>
            <div className="flex gap-1.5 flex-wrap">
              {BRAINS.map(b => {
                const on = selectedBrains.has(b.id);
                return (
                  <button key={b.id} onClick={() => toggleBrain(b.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest transition-all"
                    style={{
                      background: on ? b.color + "20" : "#131009",
                      border: `1px solid ${on ? b.color + "60" : "#2B2216"}`,
                      color: on ? b.color : "#333",
                    }}>
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#131009] border border-[#2B2216] rounded-xl p-3">
              {activeMetric === "roi" && <RoiChart history={history} brains={activeBrains} />}
              {activeMetric === "drawdown" && <DrawdownChart history={history} brains={activeBrains} />}
              {activeMetric === "sharpe" && <SharpeChart history={history} brains={activeBrains} />}
            </div>

            <div>
              <div className="text-[8px] font-bold tracking-widest text-[#8A7F6D] mb-2">BRAIN BREAKDOWN</div>
              <div className="space-y-2">
                {activeBrains.map(b => (
                  <BrainMetricCard key={b.id} brain={b} history={history[b.id]} metric={activeMetric} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}