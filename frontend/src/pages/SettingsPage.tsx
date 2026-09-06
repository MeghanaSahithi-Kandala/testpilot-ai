import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Terminal
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [dbPath, setDbPath] = useState('testpilot.db');
  const [selectedProvider, setSelectedProvider] = useState('openai');

  const checkStatus = async () => {
    setBackendStatus('checking');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/health`);
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>ENVIRONMENT & INFRASTRUCTURE</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">System Configuration</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage backend endpoints, database persistence parameters, and LLM orchestration settings.
        </p>
      </div>

      {/* Backend & Database Foundation Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">FastAPI Backend Service</h2>
              <p className="text-[11px] text-zinc-400 font-mono">http://localhost:8000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium ${
                backendStatus === 'online'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : backendStatus === 'checking'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              {backendStatus === 'online' ? 'Connected (200 OK)' : backendStatus === 'checking' ? 'Testing Connection...' : 'Disconnected'}
            </span>

            <button
              onClick={checkStatus}
              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-colors"
              title="Ping Backend"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Database Setting */}
        <div className="flex items-start gap-3">
          <Database className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200">
                SQLite Persistence File
              </label>
              <span className="text-[10px] font-mono text-zinc-500">File Storage Driver</span>
            </div>
            <input
              type="text"
              value={dbPath}
              onChange={(e) => setDbPath(e.target.value)}
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-zinc-500">
              Database schema models and migrations will bind to this path in future milestones.
            </p>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Provider Configuration (Foundation Placeholder) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">AI Autonomous Provider</h2>
            <p className="text-[11px] text-zinc-400">
              Select the LLM provider for test intent parsing and root cause analysis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'openai', label: 'OpenAI GPT-4o', badge: 'Cloud' },
            { id: 'anthropic', label: 'Claude 3.5 Sonnet', badge: 'Cloud' },
            { id: 'gemini', label: 'Gemini 1.5 Pro', badge: 'Cloud' },
          ].map((prov) => (
            <button
              key={prov.id}
              type="button"
              onClick={() => setSelectedProvider(prov.id)}
              className={`p-3.5 rounded-lg border text-left transition-all ${
                selectedProvider === prov.id
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-zinc-100'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{prov.label}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {prov.badge}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 block">Configurable via .env</span>
            </button>
          ))}
        </div>
      </div>

      {/* Load Generator (k6 Engine) Parameters */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Load Testing Engine (k6)</h2>
            <p className="text-[11px] text-zinc-400">
              Runner execution boundaries and concurrency limits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Max Virtual Users (VU Cap)
            </label>
            <input
              type="number"
              defaultValue={10000}
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Default Timeout (Seconds)
            </label>
            <input
              type="number"
              defaultValue={60}
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
