import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Terminal,
  Activity,
  Cpu,
  BarChart3
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-sm text-zinc-100">TestPilot AI</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 ml-1">
              DevOps Edition
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/tests"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Test History
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-20 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Autonomous Performance Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 mb-4 font-sans">
            TestPilot AI
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-indigo-400 tracking-tight mb-6">
            Performance Testing That Thinks.
          </p>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Describe your performance goal in simple language. TestPilot plans, executes, adapts and explains the performance test.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <span>Start Testing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/new-test"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span>Configure Scenario</span>
            </Link>
          </div>
        </div>

        {/* Terminal Architecture Preview */}
        <div className="w-full max-w-4xl mt-16 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md shadow-2xl overflow-hidden relative z-10">
          <div className="px-4 py-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="text-[11px] font-mono text-zinc-500 ml-2">testpilot-workflow.sh</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">Autonomous Test Planner</div>
          </div>

          <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 select-none">$</span>
              <div>
                <span className="text-zinc-400">testpilot plan </span>
                <span className="text-indigo-300">--goal "Test checkout API under flash sale spike of 5,000 VUs"</span>
              </div>
            </div>
            <div className="text-zinc-500 text-xs pl-4 border-l-2 border-zinc-800 space-y-1">
              <p>✔ Autonomous AI analyzing target architecture and endpoint specifications...</p>
              <p>✔ Generated adaptive load profile: 0 to 5,000 VUs over 3m with ramp-down...</p>
              <p>✔ Real-time telemetry monitoring latency p95 and error thresholds...</p>
              <p className="text-emerald-400">✔ Ready for execution engine trigger.</p>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 relative z-10">
          <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-6 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Intent-Driven Planning</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Describe business load scenarios in simple English. AI parses objectives into precise load profiles without manual script drafting.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-6 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Adaptive Execution</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamically monitors latency spikes and error rate boundaries, automatically adapting traffic shapes to pinpoint breaking points.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-850 bg-zinc-900/30 p-6 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">Explained Diagnostics</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Turns raw telemetry graphs into clear, actionable executive summaries detailing latency causes and tuning recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-850 py-6 px-6 bg-zinc-950 text-center text-xs text-zinc-600 font-mono">
        TestPilot AI · Autonomous Website Performance Testing Platform · Foundation v0.1.0
      </footer>
    </div>
  );
};
