import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  Cpu,
  GitFork,
  Zap,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

export const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const testId = id || 'TP-104';

  const [loading, setLoading] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [dependencies, setDependencies] = useState<any>(null);
  const [remediationMsg, setRemediationMsg] = useState<string>('');
  const [remediationLoading, setRemediationLoading] = useState<boolean>(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const aRes = await fetch(`${API_BASE}/api/tests/${testId}/analysis`);
        if (aRes.ok) {
          const aData = await aRes.json();
          setAnalysis(aData);
        }

        const dRes = await fetch(`${API_BASE}/api/tests/${testId}/dependencies`);
        if (dRes.ok) {
          const dData = await dRes.json();
          setDependencies(dData);
        }
      } catch (err) {
        console.error('Error fetching test results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, API_BASE]);

  const handleApplyRemediation = async (action: string) => {
    setRemediationLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/remediation/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId, action: action, approved: true })
      });
      if (res.ok) {
        const data = await res.json();
        setRemediationMsg(`✓ Remediation applied: ${data.action} (${data.result})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemediationLoading(false);
    }
  };

  const downloadPdf = () => {
    window.location.href = `${API_BASE}/api/tests/${testId}/report`;
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-500 font-mono text-xs">
        Synthesizing AI Performance Doctor diagnostics & telemetry...
      </div>
    );
  }

  const verdict = analysis?.verdict || 'WARNING';
  const safeCapacity = analysis?.safe_capacity || 1350;
  const degradationRange = analysis?.degradation_range || '1300–1400 VUs';
  const peakTested = analysis?.peak_tested || 1500;
  const p50 = analysis?.p50 || 120.0;
  const p95 = analysis?.p95 || 542.0;
  const p99 = analysis?.p99 || 780.0;
  const errorRate = analysis?.error_rate || 1.2;
  const throughput = analysis?.throughput_rps || 4200.0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back Navigation & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/tests"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Test History</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={downloadPdf}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Performance Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* 1. TEST RESULT OVERALL BANNER */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                {testId}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
                  verdict === 'PASSED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : verdict === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {verdict === 'PASSED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                OVERALL VERDICT: {verdict}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Performance Assessment Findings</h1>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase">Safe Capacity</span>
              <span className="text-indigo-400 font-bold text-base">~{safeCapacity} VUs</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase">Degradation Range</span>
              <span className="text-zinc-200 font-semibold">{degradationRange}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase">Peak Tested</span>
              <span className="text-zinc-200 font-semibold">{peakTested} VUs</span>
            </div>
          </div>
        </div>

        {/* 2. REQUIREMENT VERDICT */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Requirement Verdict</span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-zinc-200">
              <span className="font-semibold text-zinc-400">Target Requirement:</span> "Support 2000 users with P95 &lt; 500ms"
            </p>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase self-start sm:self-auto ${
                verdict === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {verdict === 'PASSED' ? 'MET SLA' : 'UNFULFILLED'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">{analysis?.verdict_reason}</p>
        </div>
      </div>

      {/* 3. KEY METRICS SCORECARD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P50 Latency</span>
          <div className="text-xl font-bold font-mono text-zinc-200">{p50} ms</div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Median</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P95 Latency</span>
          <div className={`text-xl font-bold font-mono ${p95 > 500 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {p95} ms
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Threshold: &lt;500ms</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">P99 Latency</span>
          <div className="text-xl font-bold font-mono text-zinc-200">{p99} ms</div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Tail</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Error Rate</span>
          <div className={`text-xl font-bold font-mono ${errorRate > 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {errorRate}%
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Threshold: &lt;1.0%</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Throughput</span>
          <div className="text-xl font-bold font-mono text-zinc-100">{Math.round(throughput)} RPS</div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Peak Reached</span>
        </div>
      </div>

      {/* 4. PERFORMANCE GRAPHS (All 6 Major Charts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Performance Telemetry Charts (6 Core Views)</h2>
          <span className="text-[10px] font-mono text-zinc-500">Threshold & Boundary Marked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chart 1: Load vs P95 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">1. Load vs P95 Latency</span>
              <span className="text-[10px] font-mono text-rose-400">SLA: 500ms</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between relative">
              {/* Threshold line */}
              <div className="absolute top-12 left-2 right-2 border-b border-rose-500/60 border-dashed z-10 flex justify-end">
                <span className="text-[9px] font-mono text-rose-400 pr-1 -mt-3.5">Threshold 500ms</span>
              </div>
              <svg viewBox="0 0 300 100" className="w-full h-24 stroke-indigo-400 fill-none">
                <path d="M 10 85 Q 90 80, 160 70 T 230 45 T 290 10" strokeWidth="2.5" />
                {/* Degradation knee marker */}
                <circle cx="210" cy="50" r="4" fill="#f43f5e" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0 VUs</span>
                <span className="text-indigo-400 font-bold">~1350 VUs (Boundary)</span>
                <span>2000 VUs</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Load vs P99 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">2. Load vs P99 Tail Latency</span>
              <span className="text-[10px] font-mono text-amber-400">Tail Variance</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between">
              <svg viewBox="0 0 300 100" className="w-full h-24 stroke-cyan-400 fill-none">
                <path d="M 10 88 Q 100 85, 170 65 T 240 30 T 290 8" strokeWidth="2.5" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0 VUs / 220ms</span>
                <span>1350 VUs / 680ms</span>
                <span>2000 VUs / 950ms</span>
              </div>
            </div>
          </div>

          {/* Chart 3: Load vs Error Rate */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">3. Load vs Error Rate</span>
              <span className="text-[10px] font-mono text-rose-400">Limit: 1.0%</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between relative">
              <div className="absolute top-16 left-2 right-2 border-b border-rose-500/60 border-dashed z-10 flex justify-end">
                <span className="text-[9px] font-mono text-rose-400 pr-1 -mt-3.5">Limit 1.0%</span>
              </div>
              <svg viewBox="0 0 300 100" className="w-full h-24 stroke-rose-400 fill-rose-500/10">
                <path d="M 10 92 L 180 90 Q 230 80, 260 55 T 290 15" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0.0% err</span>
                <span>Inflection: ~1350</span>
                <span>5.4% err</span>
              </div>
            </div>
          </div>

          {/* Chart 4: Load vs Throughput */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">4. Load vs Throughput (RPS)</span>
              <span className="text-[10px] font-mono text-emerald-400">Plateau Point</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between">
              <svg viewBox="0 0 300 100" className="w-full h-24 stroke-emerald-400 fill-none">
                <path d="M 10 90 L 160 35 Q 210 32, 290 34" strokeWidth="2.5" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0 RPS</span>
                <span className="text-emerald-400">Plateau @ 4,200 RPS</span>
                <span>2000 VUs</span>
              </div>
            </div>
          </div>

          {/* Chart 5: VUs vs Time */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">5. VUs vs Time (Timeline)</span>
              <span className="text-[10px] font-mono text-indigo-400">Progressive Ramp</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between">
              <div className="flex items-end justify-between h-24 gap-1.5 px-2">
                {[10, 25, 50, 75, 95, 95, 85, 90, 85, 30].map((v, i) => (
                  <div key={i} style={{ height: `${v}%` }} className="flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t" />
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>0s</span>
                <span>Refinement Search</span>
                <span>180s</span>
              </div>
            </div>
          </div>

          {/* Chart 6: Response Time vs Time */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">6. Response Time vs Time</span>
              <span className="text-[10px] font-mono text-indigo-400">Continuous Probe</span>
            </div>
            <div className="h-40 rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-3 flex flex-col justify-between">
              <svg viewBox="0 0 300 100" className="w-full h-24 stroke-cyan-400 fill-none">
                <path d="M 10 82 Q 70 80, 140 75 T 200 60 T 260 30 L 290 15" strokeWidth="2.5" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>180ms</span>
                <span>Perturbation @ 90s</span>
                <span>780ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE DEPENDENCY MAP */}
      {dependencies && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-400" />
                <span>Observed Architectural Dependency Map</span>
              </h2>
              <p className="text-[11px] text-zinc-500">Topology verified from discoverable HTTP network surface</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              Interactive Topology
            </span>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              {dependencies.nodes.map((node: any) => (
                <div
                  key={node.id}
                  className={`rounded-lg border p-3 min-w-[150px] max-w-[200px] text-center ${
                    node.type === 'Database'
                      ? 'border-amber-500/40 bg-amber-500/5 border-dashed text-amber-300'
                      : node.type === 'Website'
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-200'
                  }`}
                >
                  <span className="text-[9px] font-mono uppercase block text-zinc-500">{node.type}</span>
                  <span className="text-xs font-semibold block truncate mt-0.5">{node.label}</span>
                  <span className="text-[10px] text-zinc-400 block truncate mt-1">{node.details}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 italic">
            * Strict Rule Applied: Unobservable database internal tiers are strictly flagged as "Not directly observable".
          </p>
        </div>
      )}

      {/* 6. AI PERFORMANCE DOCTOR DIAGNOSTICS */}
      <div className="rounded-xl border border-indigo-500/30 bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">AI Performance Doctor Diagnostics</h2>
              <p className="text-[11px] text-zinc-400">Autonomous reasoning: Facts vs Observations vs Hypotheses</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            LLM Diagnostic Agent
          </span>
        </div>

        {/* Executive Summary */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">Executive Summary</span>
          <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
            {analysis?.executive_summary}
          </p>
        </div>

        {/* Facts vs Observations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block">
              1. Measured Facts (Telemetry Truths)
            </span>
            <ul className="space-y-1 text-xs text-zinc-300">
              {analysis?.facts?.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 text-xs">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
            <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold block">
              2. Observations (Empirical Behavioral Patterns)
            </span>
            <ul className="space-y-1 text-xs text-zinc-300">
              {analysis?.observations?.map((o: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 text-xs">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Possible Causes vs Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
            <span className="text-[11px] font-mono uppercase text-amber-400 font-bold block">
              3. Possible Causes (AI Inferred Hypotheses)
            </span>
            <ul className="space-y-1 text-xs text-zinc-300">
              {analysis?.possible_causes?.map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 text-xs">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 space-y-2">
            <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold block">
              4. Recommended Remediation Actions
            </span>
            <ul className="space-y-1 text-xs text-zinc-300">
              {analysis?.recommendations?.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 text-xs">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 7. ALERT CORRELATION */}
      {analysis?.correlated_events?.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Correlated Performance Incident
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
              Confidence: {analysis.correlated_events[0].confidence}
            </span>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="text-xs font-semibold text-zinc-100">
              {analysis.correlated_events[0].title}
            </div>
            <div className="text-[11px] text-zinc-400">Trigger Signals Grouped into Unified Incident:</div>
            <div className="space-y-1">
              {analysis.correlated_events[0].signals.map((sig: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <span className="text-amber-400">✓</span>
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. REGRESSION DETECTION & COMPARISON */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Regression Detection vs Baseline
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            Historical Baseline Comparison
          </span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-400">
              REGRESSION OBSERVED VS PRIOR RUN (TP-102)
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Safe capacity decreased by 10% (from 1,500 VUs to ~1,350 VUs) with higher tail latency under peak traffic.
            </p>
          </div>
          <Link
            to="/compare"
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 self-start sm:self-auto transition-colors"
          >
            Open Run Comparison
          </Link>
        </div>
      </div>

      {/* 9. SAFE AUTO-REMEDIATION PANEL */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Safe Auto-Remediation Sandbox
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Pre-Approved Actions
          </span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                Action: Increase application worker capacity
              </div>
              <p className="text-[11px] text-zinc-400">
                Scale process workers in demo environment to alleviate CPU and request queue bottlenecks.
              </p>
            </div>
            <button
              type="button"
              disabled={remediationLoading}
              onClick={() => handleApplyRemediation('Increase application worker capacity')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              {remediationLoading ? 'Applying...' : 'Apply Safe Remediation'}
            </button>
          </div>

          {remediationMsg && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              {remediationMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
