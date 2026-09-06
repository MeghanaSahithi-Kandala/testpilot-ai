import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tests`);
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTests();
  }, [API_BASE]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>EXECUTIVE DOCUMENTATION</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Performance Assessment Reports</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Download comprehensive, professional PDF reports for all completed performance evaluations.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/60 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-800">
            <tr>
              <th className="px-6 py-3.5">Test Report</th>
              <th className="px-6 py-3.5">Target</th>
              <th className="px-6 py-3.5">Verdict</th>
              <th className="px-6 py-3.5">Safe Capacity</th>
              <th className="px-6 py-3.5 text-right">Download PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {(tests.length > 0 ? tests : [
              {
                id: 'TP-104',
                name: 'Checkout Flash Spike Load Benchmark',
                target_url: 'https://api.store.internal/v1/checkout',
                verdict: 'WARNING',
                safe_capacity: 1350
              },
              {
                id: 'TP-102',
                name: 'OAuth Token Minting Endurance',
                target_url: 'https://auth.internal/oauth/token',
                verdict: 'PASSED',
                safe_capacity: 2000
              }
            ]).map((t: any) => (
              <tr key={t.id} className="hover:bg-zinc-850/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-zinc-200">{t.name || t.id}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{t.id} · ReportLab Engine</div>
                </td>
                <td className="px-6 py-4 font-mono text-zinc-400 truncate max-w-[200px]">
                  {t.target_url}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                      t.verdict === 'PASSED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {t.verdict || 'COMPLETED'}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-indigo-400 font-semibold">
                  ~{t.safe_capacity || 1350} VUs
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={`${API_BASE}/api/tests/${t.id}/report`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
