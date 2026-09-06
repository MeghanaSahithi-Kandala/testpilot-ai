import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  Server,
  Zap,
  ExternalLink,
  ChevronRight,
  Cpu,
  Compass,
  GitFork,
  Radio,
  GitCompare,
  FileText
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
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

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-test', label: 'New Test', icon: PlusCircle },
    { to: '/discovery', label: 'Discovery', icon: Compass },
    { to: '/dependencies', label: 'Dependency Map', icon: GitFork },
    { to: '/live', label: 'Live Tests', icon: Radio },
    { to: '/tests', label: 'Test History', icon: History },
    { to: '/compare', label: 'Compare Runs', icon: GitCompare },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard Overview';
    if (location.pathname.startsWith('/new-test')) return 'Autonomous Test Planner';
    if (location.pathname.startsWith('/discovery')) return 'Website & API Discovery';
    if (location.pathname.startsWith('/dependencies')) return 'Architectural Dependency Map';
    if (location.pathname.startsWith('/live')) return 'Live Execution & Adaptive Timeline';
    if (location.pathname.startsWith('/tests')) return 'Test Execution History';
    if (location.pathname.startsWith('/results')) return 'Deep Performance Analysis & AI Doctor';
    if (location.pathname.startsWith('/compare')) return 'Regression & Run Comparison';
    if (location.pathname.startsWith('/reports')) return 'Generated Performance Reports';
    if (location.pathname.startsWith('/settings')) return 'System Settings';
    return 'Platform';
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-900/50 flex flex-col flex-shrink-0 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-zinc-100 flex items-center gap-1.5">
                TestPilot AI
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">Performance Engine</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Workflows
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Resources
          </div>
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>Landing Page</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          </Link>
        </div>

        {/* Backend & Mode Status Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-zinc-400 font-medium">Execution Mode</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              DEMO MODE
            </span>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-500" />
                FastAPI Health
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {backendStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation / Header */}
        <header className="h-16 border-b border-zinc-800/80 bg-zinc-900/40 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-500 hover:text-zinc-300 transition-colors">TestPilot</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-200 font-medium">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>AI Autonomous Planner</span>
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            <Link
              to="/new-test"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-sm shadow-indigo-500/20 active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Test</span>
            </Link>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
