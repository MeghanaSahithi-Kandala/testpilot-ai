import React, { useState } from 'react';
import { Compass, Search, AlertTriangle } from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://demo.example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const runDiscovery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>PASSIVE RECONNAISSANCE</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Website & API Resource Discovery</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Safely discover publicly observable endpoints, static routes, and network architecture without aggressive crawling.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
        <label className="block text-xs font-medium text-zinc-300">Target Website URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-750 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
            placeholder="https://demo.example.com"
          />
          <button
            type="button"
            disabled={loading}
            onClick={runDiscovery}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Scanning...' : 'Scan Resources'}</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Discovery Notice & Limitations</span>
            </div>
            {result.warnings.map((w: string, i: number) => (
              <p key={i} className="text-[11px] text-zinc-400 pl-5">• {w}</p>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
              <span className="text-xs font-semibold text-zinc-200 block uppercase font-mono">
                Discovered Pages ({result.pages.length})
              </span>
              <div className="space-y-2">
                {result.pages.map((p: any, i: number) => (
                  <div key={i} className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200">{p.path}</span>
                    <span className="text-[10px] uppercase text-zinc-500">{p.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
              <span className="text-xs font-semibold text-zinc-200 block uppercase font-mono">
                Discovered API Routes ({result.api_endpoints.length})
              </span>
              <div className="space-y-2">
                {result.api_endpoints.map((ep: any, i: number) => (
                  <div key={i} className="p-2.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200">{ep.path}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">{ep.method}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
