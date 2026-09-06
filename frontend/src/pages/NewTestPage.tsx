import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Compass,
  GitFork,
  Play,
  Eye,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export const NewTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Step 1: Input values
  const [targetUrl, setTargetUrl] = useState('https://demo.example.com');
  const [instruction, setInstruction] = useState(
    'Can this website support 2000 concurrent users with P95 below 500ms and error rate below 1%?'
  );

  // Step 2: Generated Plan
  const [testPlan, setTestPlan] = useState<any>(null);

  // Step 3: Discovery Result
  const [discoveryData, setDiscoveryData] = useState<any>(null);

  // Step 4: Dependency Map
  const [dependencyData, setDependencyData] = useState<any>(null);

  // Step 5: Safety Validation & Approval
  const [safetyData, setSafetyData] = useState<any>(null);
  const [userApproved, setUserApproved] = useState<boolean>(false);

  // Step 6: k6 Script
  const [k6Script, setK6Script] = useState<string>('');
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 1. Natural Language Planner
  const handleUnderstandRequirement = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, instruction: instruction })
      });
      if (!res.ok) throw new Error('Failed to plan test requirement');
      const data = await res.json();
      setTestPlan(data);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error parsing requirement');
    } finally {
      setLoading(false);
    }
  };

  // 2. Safe Website Discovery
  const handleRunDiscovery = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl })
      });
      if (!res.ok) throw new Error('Discovery scan failed');
      const data = await res.json();
      setDiscoveryData(data);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during discovery');
    } finally {
      setLoading(false);
    }
  };

  // 3. Dependency Mapping
  const handleLoadDependencies = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl })
      });
      if (!res.ok) throw new Error('Failed to map dependencies');
      const data = await res.json();
      setDependencyData(data);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error mapping dependencies');
    } finally {
      setLoading(false);
    }
  };

  // 4. Safety Guard Validation
  const handleValidateSafety = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/safety/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: targetUrl,
          max_users: testPlan?.max_users || 2000,
          duration_minutes: testPlan?.duration_minutes || 10,
          user_authorized: true
        })
      });
      if (!res.ok) throw new Error('Safety validation failed');
      const data = await res.json();
      setSafetyData(data);
      setStep(5);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during safety check');
    } finally {
      setLoading(false);
    }
  };

  // 5. Generate k6 Workload
  const handleGenerateK6 = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/tests/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_plan: testPlan })
      });
      if (!res.ok) throw new Error('Failed to generate k6 workload');
      const data = await res.json();
      setK6Script(data.script);
      setStep(6);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating script');
    } finally {
      setLoading(false);
    }
  };

  // 6. Launch Execution and Redirect to Live Test
  const handleLaunchExecution = async () => {
    if (!userApproved) {
      setErrorMsg('Please explicitly approve execution before starting the test.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      // Create Test
      const createRes = await fetch(`${API_BASE}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: targetUrl,
          requirement: instruction,
          plan: testPlan,
          mode: 'demo'
        })
      });
      if (!createRes.ok) throw new Error('Failed to initialize test run');
      const createData = await createRes.json();
      const testId = createData.test_id;

      // Start Test Runner
      const startRes = await fetch(`${API_BASE}/api/tests/${testId}/start`, {
        method: 'POST'
      });
      if (!startRes.ok) throw new Error('Failed to trigger execution engine');

      // Navigate to Live Test View
      navigate(`/live/${testId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error launching execution');
      setLoading(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(k6Script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>AUTONOMOUS PERFORMANCE WORKFLOW</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Create & Orchestrate Test</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Follow the guided pipeline: Natural language planning → Website discovery → Dependency mapping → Safety guard → k6 workload → Adaptive execution.
        </p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="grid grid-cols-6 gap-2">
          {[
            { num: 1, label: 'Intent' },
            { num: 2, label: 'AI Plan' },
            { num: 3, label: 'Discovery' },
            { num: 4, label: 'Dependencies' },
            { num: 5, label: 'Safety' },
            { num: 6, label: 'k6 Script' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-colors ${
                step === s.num
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                  : step > s.num
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                  step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : step === s.num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="truncate hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Enter URL and Natural Language Requirement */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-mono">
              1
            </span>
            <span>Target Website & Requirement Prompt</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            Natural Language Engine
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Target Website URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://demo.example.com"
              className="w-full rounded-lg border border-zinc-750 bg-zinc-950 px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Performance Requirement (Plain Natural Language)
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Check whether my website can handle 2000 concurrent users while keeping response time below 500ms and error rate below 1%."
              className="w-full rounded-lg border border-zinc-750 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] text-zinc-500 self-center">Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setInstruction(
                    'Check whether my website can handle 2000 concurrent users while keeping response time below 500ms and error rate below 1%.'
                  )
                }
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                2000 Users Stress Test
              </button>
              <button
                type="button"
                onClick={() => setInstruction('Test this website thoroughly.')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                Autonomous Strategy (Vague Prompt)
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              disabled={loading}
              onClick={handleUnderstandRequirement}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{loading && step === 1 ? 'Analyzing Requirement...' : 'Understand My Requirement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2: Structured AI Test Plan Display */}
      {step >= 2 && testPlan && (
        <div className="rounded-xl border border-indigo-500/30 bg-zinc-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-mono">
                2
              </span>
              <span>AI-Generated Test Plan</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
              Type: {testPlan.test_type}
            </span>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">Synthesized Objective</span>
            <p className="text-xs text-zinc-200 font-medium leading-relaxed">{testPlan.objective}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Concurrency</span>
              <span className="text-lg font-bold font-mono text-zinc-100">{testPlan.max_users} VUs</span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">P95 SLA Threshold</span>
              <span className="text-lg font-bold font-mono text-emerald-400">&lt; {testPlan.thresholds.p95_latency_ms} ms</span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Error Rate Limit</span>
              <span className="text-lg font-bold font-mono text-cyan-400">&lt; {testPlan.thresholds.error_rate_percent}%</span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Load Strategy</span>
              <span className="text-sm font-semibold font-mono text-indigo-300 capitalize">{testPlan.load_strategy}</span>
            </div>
          </div>

          {step === 2 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleRunDiscovery}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{loading ? 'Discovering...' : 'Discover Website & Endpoints'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Website Discovery Display */}
      {step >= 3 && discoveryData && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-mono">
                3
              </span>
              <span>Safe Resource Discovery</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              STATUS: {discoveryData.status}
            </span>
          </div>

          {/* Warnings Banner */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Observability Disclaimer:</span>
            </div>
            {discoveryData.warnings.map((w: string, i: number) => (
              <p key={i} className="text-[11px] text-zinc-400 pl-5">
                • {w}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Pages */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                Discovered HTML Pages ({discoveryData.pages.length})
              </span>
              <div className="space-y-1.5">
                {discoveryData.pages.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between font-mono text-zinc-300 text-[11px]">
                    <span>{p.path}</span>
                    <span className="text-zinc-500 text-[10px] uppercase">{p.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Endpoints */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                Discovered API Endpoints ({discoveryData.api_endpoints.length})
              </span>
              <div className="space-y-1.5">
                {discoveryData.api_endpoints.map((ep: any, i: number) => (
                  <div key={i} className="flex items-center justify-between font-mono text-zinc-300 text-[11px]">
                    <span>{ep.path}</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 text-[10px]">{ep.method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {step === 3 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleLoadDependencies}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>{loading ? 'Mapping...' : 'Generate Dependency Map'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Dependency Map Display */}
      {step >= 4 && dependencyData && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-mono">
                4
              </span>
              <span>Observable Dependency Map</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {dependencyData.nodes.length} Nodes · {dependencyData.edges.length} Edges
            </span>
          </div>

          {/* Node Graph Visualizer */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 overflow-x-auto">
            <div className="min-w-[600px] flex flex-col items-center gap-4 py-2">
              {/* Layer 1: Website */}
              <div className="flex items-center justify-center gap-4">
                {dependencyData.nodes.filter((n: any) => n.type === 'Website').map((n: any) => (
                  <div key={n.id} className="rounded-lg border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-center">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 block">WEBSITE</span>
                    <span className="text-xs font-bold text-zinc-100">{n.label}</span>
                  </div>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-700" />

              {/* Layer 2: Frontend & API Layer */}
              <div className="flex items-center justify-center gap-8">
                {dependencyData.nodes.filter((n: any) => n.type === 'Page' || n.type === 'API').map((n: any) => (
                  <div key={n.id} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-center min-w-[160px]">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block">{n.type}</span>
                    <span className="text-xs font-semibold text-zinc-200">{n.label}</span>
                  </div>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-700" />

              {/* Layer 3: Services & Databases */}
              <div className="flex items-center justify-center gap-6">
                {dependencyData.nodes.filter((n: any) => n.type === 'Service' || n.type === 'Database' || n.type === 'External Service').map((n: any) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border px-3 py-2 text-center min-w-[140px] ${
                      n.type === 'Database'
                        ? 'border-amber-500/40 bg-amber-500/5 border-dashed text-amber-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase block text-zinc-500">{n.type}</span>
                    <span className="text-xs font-medium block truncate">{n.label}</span>
                    {!n.observable && (
                      <span className="text-[9px] font-mono text-amber-400 block mt-0.5">[Unobservable]</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            * Strict Rule Applied: Only verified observable assets are confirmed. Unobserved internal database clusters are strictly marked.
          </p>

          {step === 4 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={loading}
                onClick={handleValidateSafety}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{loading ? 'Evaluating...' : 'Run Safety Guard'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: Safety Guard Display & Operator Approval */}
      {step >= 5 && safetyData && (
        <div className="rounded-xl border border-emerald-500/30 bg-zinc-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 text-xs flex items-center justify-center font-mono">
                5
              </span>
              <span>Safety Guard Verification</span>
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              {safetyData.status_message}
            </span>
          </div>

          {/* Safety Check Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {safetyData.checks.map((chk: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">{chk.name}</div>
                  <div className="text-[11px] text-zinc-400">{chk.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* User Approval Checkbox */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-950/80 p-4 flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={userApproved}
                onChange={(e) => setUserApproved(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-zinc-200 font-medium">
                I verify that I have authorization to evaluate this endpoint and approve test execution.
              </span>
            </label>

            {step === 5 && (
              <button
                type="button"
                disabled={loading || !userApproved}
                onClick={handleGenerateK6}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 flex-shrink-0"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Compiling...' : 'Generate k6 Script'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: k6 Workload & Launch Execution */}
      {step >= 6 && k6Script && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-mono">
                6
              </span>
              <span>k6 Workload Script Generated</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowScriptModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Generated k6 Script</span>
            </button>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-400 max-h-40 overflow-y-auto">
            <pre className="text-[11px] leading-relaxed">{k6Script.slice(0, 500)}...</pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500 font-mono">
              Ready for Autonomous Adaptive Execution
            </span>

            <button
              type="button"
              disabled={loading}
              onClick={handleLaunchExecution}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Launching Test...' : 'Launch Autonomous Test'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-200">Generated k6 Workload (JavaScript)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyScript}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-zinc-300 bg-zinc-950">
              <pre className="text-[11px] leading-relaxed">{k6Script}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
