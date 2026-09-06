import React, { useState } from 'react';
import { GitCompare, TrendingDown } from 'lucide-react';

export const CompareRunsPage: React.FC = () => {
  const [baseRun, setBaseRun] = useState('TP-102');
  const [targetRun, setTargetRun] = useState('TP-104');
  const comparison = {
    base_test_id: 'TP-102',
    target_test_id: 'TP-104',
    verdict: 'REGRESSION DETECTED',
    summary: 'Safe capacity decreased by 10% (from 1,500 VUs to ~1,350 VUs) with higher P95 latency (+122ms).',
    safe_capacity_delta: -150,
    safe_capacity_delta_pct: -10.0,
    p95_delta_ms: 122.0,
    error_rate_delta_pct: 0.8
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <GitCompare className="w-3.5 h-3.5" />
          <span>BENCHMARK AUDIT</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Regression Detection & Run Comparison</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Audit variance between consecutive test runs to detect performance degradation before production releases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Baseline Test</span>
          <select
            value={baseRun}
            onChange={(e) => setBaseRun(e.target.value)}
            className="w-full rounded-lg border border-zinc-750 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200"
          >
            <option value="TP-102">TP-102 (Baseline Run · 1,500 VUs)</option>
            <option value="TP-100">TP-100 (Initial Benchmark · 800 VUs)</option>
          </select>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Comparison Test</span>
          <select
            value={targetRun}
            onChange={(e) => setTargetRun(e.target.value)}
            className="w-full rounded-lg border border-zinc-750 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200"
          >
            <option value="TP-104">TP-104 (Current Test · 2,000 VUs Plan)</option>
            <option value="TP-103">TP-103 (Search Stress Run)</option>
          </select>
        </div>
      </div>

      {comparison && (
        <div className="rounded-xl border border-amber-500/30 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-amber-300 uppercase font-mono">
                {comparison.verdict}
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {comparison.base_test_id} vs {comparison.target_test_id}
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-medium leading-relaxed">{comparison.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Safe Capacity Shift</span>
              <div className="text-xl font-bold font-mono text-rose-400">
                {comparison.safe_capacity_delta} VUs ({comparison.safe_capacity_delta_pct}%)
              </div>
              <span className="text-[10px] text-zinc-400">Degradation onset moved earlier</span>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P95 Latency Delta</span>
              <div className="text-xl font-bold font-mono text-amber-400">
                +{comparison.p95_delta_ms} ms
              </div>
              <span className="text-[10px] text-zinc-400">Slower response times</span>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Error Rate Delta</span>
              <div className="text-xl font-bold font-mono text-amber-400">
                +{comparison.error_rate_delta_pct}%
              </div>
              <span className="text-[10px] text-zinc-400">Escalated 5xx failure count</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
