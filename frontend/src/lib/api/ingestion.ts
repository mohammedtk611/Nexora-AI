import { apiFetch, API_MODE } from './client';
import { IngestionResponse } from '@/types/ingestion';

export const ingestionApi = {
  uploadFile: async (projectId: string, file: File): Promise<IngestionResponse> => {
    if (API_MODE === 'mock') {
      return {
        ingestion_id: 'doc_' + Date.now(),
        source_document_id: 'doc_' + Date.now(),
        project_id: projectId,
        status: 'completed',
        title: file.name,
        source_type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
        created_at: new Date().toISOString(),
      };
    }

    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('file', file);

    return apiFetch<IngestionResponse>('/ingestion/upload', {
      method: 'POST',
      body: formData,
    });
  },

  ingestUrl: async (projectId: string, url: string, title?: string): Promise<IngestionResponse> => {
    if (API_MODE === 'mock') {
      return {
        ingestion_id: 'doc_' + Date.now(),
        source_document_id: 'doc_' + Date.now(),
        project_id: projectId,
        status: 'completed',
        title: title || url,
        source_type: 'url',
        created_at: new Date().toISOString(),
      };
    }
    return apiFetch<IngestionResponse>('/ingestion/url', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, url, title }),
    });
  },

  ingestText: async (projectId: string, title: string, text: string): Promise<IngestionResponse> => {
    if (API_MODE === 'mock') {
      return {
        ingestion_id: 'doc_' + Date.now(),
        source_document_id: 'doc_' + Date.now(),
        project_id: projectId,
        status: 'completed',
        title,
        source_type: 'text',
        created_at: new Date().toISOString(),
      };
    }
    return apiFetch<IngestionResponse>('/ingestion/text', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, title, text }),
    });
  },

  getStatus: async (ingestionId: string): Promise<IngestionResponse> => {
    if (API_MODE === 'mock') {
      return {
        ingestion_id: ingestionId,
        source_document_id: ingestionId,
        project_id: 'proj_01',
        status: 'completed',
        title: 'Uploaded Document',
        source_type: 'pdf',
        created_at: new Date().toISOString(),
      };
    }
    return apiFetch<IngestionResponse>(`/ingestion/${ingestionId}`);
  },
};
