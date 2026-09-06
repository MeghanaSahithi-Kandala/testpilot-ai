import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  ExternalLink,
  Play
} from 'lucide-react';

interface TestRecord {
  id: string;
  name: string;
  targetUrl: string;
  vus: number;
  duration: string;
  p95: string;
  rps: string;
  errorRate: string;
  status: 'completed' | 'running' | 'failed';
  date: string;
}

const mockHistory: TestRecord[] = [
  {
    id: 'TP-104',
    name: 'Checkout Flash Spike Load',
    targetUrl: 'https://api.store.internal/v1/checkout',
    vus: 500,
    duration: '3m 00s',
    p95: '142 ms',
    rps: '1,240',
    errorRate: '0.02%',
    status: 'completed',
    date: '2026-09-05 14:32 UTC',
  },
  {
    id: 'TP-103',
    name: 'Search Autosuggest Stress Test',
    targetUrl: 'https://api.store.internal/v2/search',
    vus: 1500,
    duration: '5m 00s',
    p95: '340 ms',
    rps: '3,850',
    errorRate: '0.45%',
    status: 'completed',
    date: '2026-09-04 18:15 UTC',
  },
  {
    id: 'TP-102',
    name: 'OAuth Token Minting Endurance',
    targetUrl: 'https://auth.internal/oauth/token',
    vus: 2000,
    duration: '2m 30s',
    p95: '82 ms',
    rps: '4,120',
    errorRate: '0.00%',
    status: 'completed',
    date: '2026-09-03 09:40 UTC',
  },
  {
    id: 'TP-101',
    name: 'Payment Processing Capacity Limit',
    targetUrl: 'https://payments.internal/process',
    vus: 300,
    duration: '1m 15s',
    p95: '950 ms',
    rps: '210',
    errorRate: '12.4%',
    status: 'failed',
    date: '2026-09-02 21:05 UTC',
  },
  {
    id: 'TP-100',
    name: 'Catalog Inventory Query Benchmark',
    targetUrl: 'https://api.store.internal/v1/items',
    vus: 800,
    duration: '4m 00s',
    p95: '115 ms',
    rps: '2,300',
    errorRate: '0.01%',
    status: 'completed',
    date: '2026-09-01 11:20 UTC',
  },
];

export const TestHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  const filteredTests = mockHistory.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <History className="w-3.5 h-3.5" />
            <span>AUDIT & EXPERIMENT LOGS</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Performance Test History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review previous performance benchmarks, SLAs, and diagnostic logs.
          </p>
        </div>

        <Link
          to="/new-test"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Test</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by test name, ID or endpoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          {(['all', 'completed', 'failed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors capitalize ${
                statusFilter === filter
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Test Runs Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Test Run</th>
                <th className="px-6 py-3.5">Target Endpoint</th>
                <th className="px-6 py-3.5">Load Profile</th>
                <th className="px-6 py-3.5">P95 Latency</th>
                <th className="px-6 py-3.5">Throughput</th>
                <th className="px-6 py-3.5">Errors</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTests.map((test) => (
                <tr key={test.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-200">{test.name}</div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      {test.id} · {test.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-400 truncate max-w-[220px]">
                    {test.targetUrl}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-zinc-300">{test.vus} VUs</div>
                    <div className="text-[11px] text-zinc-500">{test.duration}</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-zinc-200">
                    {test.p95}
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-400">
                    {test.rps} RPS
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <span
                      className={
                        test.errorRate === '0.00%' || test.errorRate === '0.01%' || test.errorRate === '0.02%'
                          ? 'text-emerald-400'
                          : test.errorRate.startsWith('0.')
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {test.errorRate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        test.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : test.status === 'running'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/results/${test.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
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
