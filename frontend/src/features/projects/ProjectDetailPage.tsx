import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { knowledgeApi } from '@/lib/api/knowledge';
import { transformationsApi } from '@/lib/api/transformations';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderGit2, ArrowLeft, Database, Sparkles, FileText, Clock, ExternalLink } from 'lucide-react';

import { Transformation } from '@/types/transformation';

interface ProjectDetailPageProps {
  id?: string;
  onNavigate?: (route: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ id, onNavigate }) => {
  // Extract project ID from URL window location if not passed explicitly as prop
  const pathId = id || window.location.pathname.split('/projects/')[1];

  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', pathId],
    queryFn: () => projectsApi.get(pathId),
    enabled: !!pathId,
  });

  const { data: knowledgeDocs = [] } = useQuery({
    queryKey: ['knowledge-docs', pathId],
    queryFn: () => knowledgeApi.listDocuments(pathId),
    enabled: !!pathId,
  });

  const { data: transformations = [] } = useQuery<Transformation[]>({
    queryKey: ['transformations', pathId],
    queryFn: () => transformationsApi.list(pathId),
  });

  if (isProjectLoading) return <LoadingState label="Loading project details..." />;
  if (projectError || !project) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="Project Not Found"
        description={`No project with identifier '${pathId}' was found.`}
        actionLabel="Back to Projects"
        onAction={() => window.location.href = '/projects'}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-slate-500 uppercase tracking-wider">
            <a href="/projects" className="hover:text-accent flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Projects
            </a>
            <span>/</span>
            <span>{project.id}</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderGit2 className="h-7 w-7 text-accent" />
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-slate-400 mt-2 max-w-3xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge status={project.status || 'active'} />
          <a
            href={`/transform/new?project_id=${project.id}`}
            className="btn btn-primary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            New Transformation
          </a>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Associated Transformations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label flex items-center gap-2 m-0">
              <Sparkles className="h-4 w-4 text-accent" />
              Project Transformations
            </h2>
          </div>

          {transformations.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No transformations recorded"
              description="Launch a new transformation to extract structured intelligence and output deliverables for this project."
            />
          ) : (
            <div className="space-y-4">
              {transformations.map(t => (
                <div key={t.id} className="bg-surface border border-border rounded-lg p-5 hover:border-slate-600 transition flex items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold truncate">{t.source_document?.title || t.id}</span>
                      <SeverityBadge severity={t.severity || t.urgency_level || 'low'} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Audience: <strong className="text-slate-300">{t.target_audience}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Outputs: <strong className="text-slate-300">{t.output_formats.length} requested</strong></span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/transform/${t.id}`}
                    className="btn btn-secondary text-xs shrink-0 px-4"
                  >
                    View Outputs
                    <ExternalLink className="h-3.5 w-3.5 ml-2" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Indexed Knowledge Sources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label flex items-center gap-2 m-0">
              <Database className="h-4 w-4 text-emerald-400" />
              Indexed RAG Context ({knowledgeDocs.length})
            </h2>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
            {knowledgeDocs.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No knowledge base documents indexed for this specific project. Standard global intelligence corpus will be queried.
              </p>
            ) : (
              knowledgeDocs.map(doc => (
                <div key={doc.id} className="p-3 rounded bg-bg-primary border border-border flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-1">{doc.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono tracking-wider">
                      <span className="uppercase text-emerald-400">{doc.source_type}</span>
                      <span className="text-slate-600">•</span>
                      <span>{doc.chunk_count} chunks</span>
                    </div>
                  </div>
                  <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                </div>
              ))
            )}

            <a
              href="/knowledge-base"
              className="w-full btn btn-secondary mt-2 flex justify-center"
            >
              Manage Knowledge Base
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
