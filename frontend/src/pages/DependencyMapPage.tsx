import React, { useState, useEffect } from 'react';
import { GitFork, Plus, Layers, Info } from 'lucide-react';

export const DependencyMapPage: React.FC = () => {
  const [targetUrl] = useState('https://demo.example.com');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState('Service');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchDependencies = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleAddCustom = () => {
    if (!customLabel) return;
    const newNode = {
      id: `user_node_${Date.now()}`,
      type: customType,
      label: customLabel,
      observable: true,
      details: 'User explicitly supplied dependency'
    };
    setNodes([...nodes, newNode]);
    setCustomLabel('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <GitFork className="w-3.5 h-3.5" />
          <span>TOPOLOGY GRAPH</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">Architectural Dependency Map</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Visual representation of discovered observable nodes, external services, and declared infrastructure links.
        </p>
      </div>

      {/* Dependency Map Canvas */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-200">Observed Service Graph</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {nodes.length} Nodes · {edges.length} Dispatched Edges
          </span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 overflow-x-auto min-h-[260px] flex flex-wrap items-center justify-center gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`rounded-xl border p-4 min-w-[170px] max-w-[210px] text-center transition-all ${
                node.type === 'Database'
                  ? 'border-amber-500/40 bg-amber-500/5 border-dashed text-amber-300'
                  : node.type === 'Website'
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200 font-bold'
                  : node.type === 'API'
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[9px] font-mono uppercase text-zinc-400">
                <span>{node.type}</span>
                {!node.observable && <span className="text-amber-400 font-bold">[Hidden]</span>}
              </div>
              <div className="text-xs font-semibold truncate">{node.label}</div>
              <div className="text-[10px] text-zinc-400 mt-1 truncate">{node.details}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            Strict Rule: Only verified publicly discoverable components are linked. Subsurface databases and private caches are clearly marked as unobservable unless explicitly provided below.
          </span>
        </div>
      </div>

      {/* Manual Dependency Addition */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
        <h2 className="text-xs font-semibold text-zinc-200 uppercase font-mono">
          Declare Known Subsurface Dependency
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Postgres Primary Cluster or Redis Cache"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-750 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            className="rounded-lg border border-zinc-750 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Database">Database</option>
            <option value="Service">Internal Microservice</option>
            <option value="External Service">Third-Party Gateway</option>
          </select>
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Graph</span>
          </button>
        </div>
      </div>
    </div>
  );
};
