import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Cpu,
  StopCircle,
  ArrowRight
} from 'lucide-react';

export const LiveTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const testId = id || 'TP-ACTIVE';

  const [status, setStatus] = useState<string>('running');
  const [currentVus, setCurrentVus] = useState<number>(100);
  const [peakVus, setPeakVus] = useState<number>(100);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [adaptiveDecisions, setAdaptiveDecisions] = useState<any[]>([]);
  const [safeCapacity, setSafeCapacity] = useState<number>(0);
  const [degradationRange, setDegradationRange] = useState<string>('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    let isMounted = true;

    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tests/${testId}/status`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setStatus(data.status);
          setCurrentVus(data.current_vus);
          setPeakVus(data.peak_vus);
          if (data.safe_capacity) setSafeCapacity(data.safe_capacity);
          if (data.degradation_range) setDegradationRange(data.degradation_range);
        }

        const mRes = await fetch(`${API_BASE}/api/tests/${testId}/metrics`);
        if (mRes.ok && isMounted) {
          const mData = await mRes.json();
          setMetrics(mData.metrics || []);
          if (mData.adaptive_decisions) {
            setAdaptiveDecisions(mData.adaptive_decisions);
          }
        }
      } catch (err) {
        console.error('Error polling telemetry:', err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [testId, API_BASE]);

  const handleStop = async () => {
    try {
      await fetch(`${API_BASE}/api/tests/${testId}/stop`, { method: 'POST' });
      setStatus('stopped');
    } catch (e) {
      console.error(e);
    }
  };

  const latest = metrics[metrics.length - 1] || {
    vus: currentVus,
    rps: 420.0,
    p50: 85.0,
    p95: 184.0,
    p99: 240.0,
    error_rate: 0.05,
    phase: 'HEALTHY'
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              {testId}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase border ${
                status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : status === 'running'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'running' ? 'bg-indigo-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              {status}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
              DEMO SIMULATION
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Live Performance Telemetry</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time adaptive testing loop: LOAD → OBSERVE → DECIDE → ADJUST → REFINEMENT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {status === 'running' ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Test</span>
            </button>
          ) : (
            <Link
              to={`/results/${testId}`}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98]"
            >
              <span>View Deep Analysis & Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Current VUs</span>
          <div className="text-2xl font-bold font-mono text-zinc-100">{latest.vus}</div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Peak: {peakVus} VUs</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Requests / Sec</span>
          <div className="text-2xl font-bold font-mono text-zinc-100">{Math.round(latest.rps)}</div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Throughput</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P95 Latency</span>
          <div
            className={`text-2xl font-bold font-mono ${
              latest.p95 > 500 ? 'text-rose-400' : latest.p95 > 400 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {Math.round(latest.p95)} ms
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Limit: 500 ms</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P99 Latency</span>
          <div className="text-2xl font-bold font-mono text-zinc-100">{Math.round(latest.p99)} ms</div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Tail Latency</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Error Rate</span>
          <div
            className={`text-2xl font-bold font-mono ${
              latest.error_rate > 1.0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {latest.error_rate}%
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">Limit: 1.0%</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Safe Capacity</span>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {safeCapacity ? `~${safeCapacity}` : 'Evaluating...'}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block truncate">
            {degradationRange || 'Searching'}
          </span>
        </div>
      </div>

      {/* Section 12: Adaptive Search Timeline */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Adaptive Load Search Timeline</h2>
            <p className="text-[11px] text-zinc-500">
              Autonomous load progression isolating the degradation boundary
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            LOAD → OBSERVE → ADJUST
          </span>
        </div>

        {/* Visual Timeline Steps */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center gap-2 min-w-[700px]">
            {[
              { vu: 100, status: 'pass', label: '100 VUs' },
              { vu: 250, status: 'pass', label: '250 VUs' },
              { vu: 500, status: 'pass', label: '500 VUs' },
              { vu: 750, status: 'pass', label: '750 VUs' },
              { vu: 1000, status: 'pass', label: '1000 VUs' },
              { vu: 1250, status: 'warn', label: '1250 VUs ⚠' },
              { vu: 1500, status: 'fail', label: '1500 VUs ❌' },
              { vu: 'REFINE', status: 'refine', label: 'REFINE' },
              { vu: 1350, status: 'boundary', label: '~1350 VUs' },
            ].map((stepItem, idx) => (
              <React.Fragment key={idx}>
                <div
                  className={`px-3 py-2 rounded-lg border text-center font-mono text-xs transition-all ${
                    stepItem.status === 'boundary'
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                      : stepItem.status === 'fail'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 font-semibold'
                      : stepItem.status === 'warn'
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      : stepItem.status === 'refine'
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-[10px]'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  <span className="block text-[9px] uppercase opacity-75">
                    {stepItem.status === 'boundary' ? 'BOUNDARY' : stepItem.status === 'fail' ? 'DEGRADED' : 'HEALTHY'}
                  </span>
                  <span>{stepItem.label}</span>
                </div>
                {idx < 8 && <span className="text-zinc-600 select-none">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {safeCapacity > 0 && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200 flex items-center justify-between">
            <div>
              <span className="font-semibold">Observed Safe Capacity Boundary:</span> ~{safeCapacity} VUs
              <span className="text-zinc-400 ml-2">(Degradation localized between {degradationRange})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">
              BOUNDARY FOUND
            </span>
          </div>
        )}
      </div>

      {/* Section 10: AI Decision Engine Console */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">AI Decision Engine Activity Log</h2>
              <p className="text-[11px] text-zinc-500">Autonomous reasoning at each step of the search loop</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {adaptiveDecisions.length} Decisions Evaluated
          </span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto font-sans text-xs">
          {adaptiveDecisions.length === 0 ? (
            <div className="text-zinc-500 text-center py-6 font-mono text-xs">
              Initializing autonomous telemetry probes...
            </div>
          ) : (
            adaptiveDecisions.map((dec, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                      STEP {dec.step_number}
                    </span>
                    <span className="text-indigo-400 font-semibold">{dec.decision}</span>
                  </div>
                  <p className="text-zinc-400 text-xs">{dec.reason}</p>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400 self-end sm:self-center flex-shrink-0">
                  <span>{dec.current_load} VUs</span>
                  <span>·</span>
                  <span className={dec.p95_ms > 500 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                    {dec.p95_ms}ms
                  </span>
                  <span>·</span>
                  <span>{dec.error_rate}% err</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
