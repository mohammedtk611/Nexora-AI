import { apiFetch, API_MODE } from './client';
import { Project, ProjectCreateRequest } from '@/types/project';
import { mockProjects } from './mock/mockData';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    if (API_MODE === 'mock') return mockProjects;
    try {
      return await apiFetch<Project[]>('/projects');
    } catch {
      return mockProjects;
    }
  },

  get: async (id: string): Promise<Project> => {
    if (API_MODE === 'mock') {
      return mockProjects.find(p => p.id === id) || mockProjects[0];
    }
    try {
      return await apiFetch<Project>(`/projects/${id}`);
    } catch {
      return mockProjects.find(p => p.id === id) || mockProjects[0];
    }
  },

  create: async (data: ProjectCreateRequest): Promise<Project> => {
    if (API_MODE === 'mock') {
      const newProj: Project = {
        id: 'proj_' + Date.now(),
        name: data.name,
        description: data.description,
        status: 'active',
        owner_id: 'usr_mock_001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProjects.unshift(newProj);
      return newProj;
    }
    return apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    if (API_MODE === 'mock') return;
    return apiFetch(`/projects/${id}`, { method: 'DELETE' });
  },
};
