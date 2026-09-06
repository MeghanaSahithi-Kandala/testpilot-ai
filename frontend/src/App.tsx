import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewTestPage } from './pages/NewTestPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { DependencyMapPage } from './pages/DependencyMapPage';
import { LiveTestPage } from './pages/LiveTestPage';
import { TestHistoryPage } from './pages/TestHistoryPage';
import { TestResultPage } from './pages/TestResultPage';
import { CompareRunsPage } from './pages/CompareRunsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Platform Architecture & Workflows */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/new-test" element={<NewTestPage />} />
          <Route path="/discovery" element={<DiscoveryPage />} />
          <Route path="/dependencies" element={<DependencyMapPage />} />
          <Route path="/live" element={<LiveTestPage />} />
          <Route path="/live/:id" element={<LiveTestPage />} />
          <Route path="/tests" element={<TestHistoryPage />} />
          <Route path="/results/:id" element={<TestResultPage />} />
          <Route path="/compare" element={<CompareRunsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
