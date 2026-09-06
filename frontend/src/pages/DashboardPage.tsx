import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  PlusCircle,
  Clock,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-indigo-950/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-1">
            Performance Testing Control Center
          </h1>
          <p className="text-xs text-zinc-400">
            Monitor system health, review automated load assessments, and initiate new test plans.
          </p>
        </div>
        <Link
          to="/new-test"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Performance Test</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tests</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">24</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+12% this week</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Avg P95 Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">184 ms</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400 font-mono">
            <span>Target: &lt; 250 ms</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Throughput</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">3,420 RPS</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
            <span>No throttling detected</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">99.82%</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400 font-mono">
            <span>HTTP 2xx/3xx ratio</span>
          </div>
        </div>
      </div>

      {/* Chart Placeholders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency & Throughput Chart Placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Throughput & Latency Trend</h2>
              <p className="text-[11px] text-zinc-500">Historical performance across last 7 executions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> RPS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> P95 (ms)
              </span>
            </div>
          </div>

          {/* Chart Visual Placeholder */}
          <div className="h-64 w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-950/60 p-6 flex flex-col justify-between">
            <div className="flex justify-between text-[10px] font-mono text-zinc-600">
              <span>4,000 RPS / 400ms</span>
              <span>2,000 RPS / 200ms</span>
              <span>0 RPS / 0ms</span>
            </div>

            {/* Simulated Grid SVG */}
            <div className="h-40 flex items-end justify-between gap-3 px-2">
              {[
                { rps: 45, lat: 30, day: 'Run 1' },
                { rps: 60, lat: 40, day: 'Run 2' },
                { rps: 75, lat: 35, day: 'Run 3' },
                { rps: 50, lat: 60, day: 'Run 4' },
                { rps: 90, lat: 45, day: 'Run 5' },
                { rps: 70, lat: 32, day: 'Run 6' },
                { rps: 85, lat: 38, day: 'Run 7' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full max-w-[28px] flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${bar.rps}%` }}
                      className="w-1/2 bg-indigo-600/60 hover:bg-indigo-500 rounded-t transition-all"
                    />
                    <div
                      style={{ height: `${bar.lat}%` }}
                      className="w-1/2 bg-cyan-500/50 hover:bg-cyan-400 rounded-t transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="text-center text-[11px] text-zinc-500 font-mono">
              [Telemetry Telemetry Visualizer Placeholder · Live Charting Engine Ready]
            </div>
          </div>
        </div>

        {/* Quick Diagnostics Placeholder */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-100">AI Health Summary</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              TestPilot AI continuously evaluates test outputs to isolate latency anomalies and regression candidates.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-200 mb-1">
                  <span>Checkout API Gateway</span>
                  <span className="text-[10px] font-mono text-emerald-400">Stable</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Latency variance remained under 12ms during 2,000 VUs ramp.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-200 mb-1">
                  <span>Product Search Endpoint</span>
                  <span className="text-[10px] font-mono text-amber-400">Caution</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  P95 climbed to 340ms when concurrent users exceeded 1,500.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <Link
              to="/tests"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-between transition-colors"
            >
              <span>Explore full test records</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tests Table Placeholder */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Recent Test Runs</h2>
            <p className="text-[11px] text-zinc-500">Recent performance evaluations and execution states</p>
          </div>
          <Link
            to="/tests"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            View all ({'5'})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/50 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Target Endpoint</th>
                <th className="px-6 py-3">Load Shape</th>
                <th className="px-6 py-3">P95 Latency</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {[
                {
                  id: 'TP-104',
                  url: 'https://api.store.internal/v1/checkout',
                  load: '500 VUs · 3m',
                  latency: '142 ms',
                  status: 'completed',
                  statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                },
                {
                  id: 'TP-103',
                  url: 'https://api.store.internal/v2/search',
                  load: '1,500 VUs · 5m',
                  latency: '340 ms',
                  status: 'completed',
                  statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                },
                {
                  id: 'TP-102',
                  url: 'https://auth.internal/oauth/token',
                  load: '2,000 VUs · 2m',
                  latency: '82 ms',
                  status: 'completed',
                  statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                },
                {
                  id: 'TP-101',
                  url: 'https://payments.internal/process',
                  load: '300 VUs · 1m',
                  latency: '—',
                  status: 'failed',
                  statusColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }
              ].map((row) => (
                <tr key={row.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-zinc-400">{row.id}</td>
                  <td className="px-6 py-3.5 font-mono text-zinc-200">{row.url}</td>
                  <td className="px-6 py-3.5 text-zinc-400">{row.load}</td>
                  <td className="px-6 py-3.5 font-mono text-zinc-300">{row.latency}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      to={`/results/${row.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Report</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
