import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { FolderGit2, Plus, Search, Calendar, FileText, ArrowRight, Trash2 } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate?: (route: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || undefined,
    });
  };

  if (isLoading) return <LoadingState label="Loading intelligence projects..." />;
  if (error) return <EmptyState icon={FolderGit2} title="Failed to load projects" description="There was an error communicating with the backend API." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Intelligence Projects
          </h1>
          <p className="text-sm text-slate-400">
            Organize transformations, source documents, and knowledge repositories by mission or threat campaign.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total Projects: <span className="text-slate-200 font-semibold">{filteredProjects.length}</span>
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description={search ? "No project matches your search parameters." : "Create your first intelligence project to organize document transformations."}
          actionLabel={!search ? "Create First Project" : undefined}
          onAction={!search ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-surface border border-border rounded-lg p-5 hover:border-slate-600 transition flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-slate-100 line-clamp-1">{project.name}</h3>
                  <StatusBadge status={project.status || 'active'} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {project.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-border mb-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-accent">
                    <FileText className="h-3.5 w-3.5" />
                    {project.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/projects/${project.id}`}
                    className="flex-1 btn btn-secondary text-xs py-1.5 justify-center"
                  >
                    View Project <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-danger hover:bg-danger/10 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-accent" />
              New Intelligence Project
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation CyberStorm 2026"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the campaign, threat actor, or objective..."
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="input w-full resize-none py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
