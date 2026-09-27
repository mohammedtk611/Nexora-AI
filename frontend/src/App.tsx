import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';

// Feature Views
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { NewTransformationPage } from '@/features/transformation/NewTransformationPage';
import { JobProcessingPage } from '@/features/transformation/JobProcessingPage';
import { TransformationResultPage } from '@/features/transformation/TransformationResultPage';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage';
import { KnowledgeBasePage } from '@/features/knowledge/KnowledgeBasePage';
import { ArtifactsPage } from '@/features/artifacts/ArtifactsPage';
import { ArtifactDetailPage } from '@/features/artifacts/ArtifactDetailPage';
import { TemplatesPage } from '@/features/templates/TemplatesPage';
import { AuditPage } from '@/features/audit/AuditPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppContent: React.FC = () => {
  const { isAuthenticated, initialize, isLoading } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-mono text-xs text-accent">
        Initializing Revamp AI Platform Session...
      </div>
    );
  }

  // Unauthenticated Route Handler (Bypassed)
  // We completely skip the login page and just let them see the dashboard.
  if (currentPath === '/login') {
    window.history.replaceState({}, '', '/');
  }

  // Router Dispatcher for Authenticated Shell
  const handleNavigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentPath(route);
  };

  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    if (path === '/' || path === '/dashboard') {
      return <DashboardPage onNavigate={handleNavigate} />;
    }
    if (path === '/transform/new' || path.startsWith('/transform/new')) {
      return <NewTransformationPage onNavigate={handleNavigate} />;
    }
    if (path.startsWith('/jobs/')) {
      const jobId = path.split('/jobs/')[1];
      return <JobProcessingPage jobId={jobId} onNavigate={handleNavigate} />;
    }
    if (path.startsWith('/transform/')) {
      const transformId = path.split('/transform/')[1];
      return <TransformationResultPage transformationId={transformId} onNavigate={handleNavigate} />;
    }
    if (path === '/projects') {
      return <ProjectsPage onNavigate={handleNavigate} />;
    }
    if (path.startsWith('/projects/')) {
      const projId = path.split('/projects/')[1];
      return <ProjectDetailPage id={projId} onNavigate={handleNavigate} />;
    }
    if (path === '/knowledge-base') {
      return <KnowledgeBasePage onNavigate={handleNavigate} />;
    }
    if (path === '/artifacts') {
      return <ArtifactsPage onNavigate={handleNavigate} />;
    }
    if (path.startsWith('/artifacts/')) {
      const artId = path.split('/artifacts/')[1];
      return <ArtifactDetailPage id={artId} onNavigate={handleNavigate} />;
    }
    if (path === '/templates') {
      return <TemplatesPage onNavigate={handleNavigate} />;
    }
    if (path === '/activity' || path === '/audit') {
      return <AuditPage onNavigate={handleNavigate} />;
    }
    if (path === '/settings') {
      return <SettingsPage onNavigate={handleNavigate} />;
    }

    // Default Fallback
    return <DashboardPage onNavigate={handleNavigate} />;
  };

  const getPageTitle = (path: string): string => {
    const p = path.toLowerCase();
    if (p === '/' || p === '/dashboard') return 'Analyst Command Dashboard';
    if (p.startsWith('/transform/new')) return 'New Intelligence Transformation';
    if (p.startsWith('/jobs/')) return 'Live Agent Processing Pipeline';
    if (p.startsWith('/transform/')) return 'Transformation Deliverables Workspace';
    if (p.startsWith('/projects')) return 'Intelligence Projects';
    if (p === '/knowledge-base') return 'Knowledge Base & RAG Storage';
    if (p.startsWith('/artifacts')) return 'Artifacts Library';
    if (p === '/templates') return 'Transformation Templates';
    if (p === '/activity' || p === '/audit') return 'Activity & Audit Log';
    if (p === '/settings') return 'System & Engine Settings';
    return 'Analyst Command Dashboard';
  };

  return (
    <AppShell
      title={getPageTitle(currentPath)}
      currentRoute={currentPath}
      onNavigate={handleNavigate}
    >
      {renderRoute()}
    </AppShell>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
