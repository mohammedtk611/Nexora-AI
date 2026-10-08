import { apiFetch, API_MODE } from './client';
import { Artifact } from '@/types/artifact';
import { mockArtifacts } from './mock/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const artifactsApi = {
  list: async (transformationId?: string): Promise<Artifact[]> => {
    if (API_MODE === 'mock') {
      if (transformationId) {
        return mockArtifacts.filter(a => a.transformation_id === transformationId);
      }
      return mockArtifacts;
    }
    const query = transformationId ? `?transformation_id=${transformationId}` : '';
    try {
      return await apiFetch<Artifact[]>(`/artifacts${query}`);
    } catch {
      if (transformationId) {
        return mockArtifacts.filter(a => a.transformation_id === transformationId);
      }
      return mockArtifacts;
    }
  },

  get: async (id: string): Promise<Artifact> => {
    if (API_MODE === 'mock') {
      return mockArtifacts.find(a => a.id === id) || mockArtifacts[0];
    }
    try {
      return await apiFetch<Artifact>(`/artifacts/${id}`);
    } catch {
      return mockArtifacts.find(a => a.id === id) || mockArtifacts[0];
    }
  },

  getDownloadUrl: (id: string): string => {
    const token = localStorage.getItem('nexora_ai_jwt');
    return `${API_BASE_URL}/api/v1/artifacts/${id}/download?token=${token || ''}`;
  },

  downloadFile: async (id: string, filename?: string): Promise<void> => {
    if (API_MODE === 'mock') {
      alert(`Mock Mode: Triggering download for artifact ${id}`);
      return;
    }

    const token = localStorage.getItem('nexora_ai_jwt');
    const response = await fetch(`${API_BASE_URL}/api/v1/artifacts/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `artifact_${id}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  regenerate: async (id: string, customInstructions?: string): Promise<Artifact> => {
    if (API_MODE === 'mock') {
      const art = mockArtifacts.find(a => a.id === id) || mockArtifacts[0];
      return { ...art, status: 'regenerated', updated_at: new Date().toISOString() };
    }
    return apiFetch<Artifact>(`/artifacts/${id}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ custom_instructions: customInstructions }),
    });
  },
};
