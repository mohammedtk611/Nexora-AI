import { apiFetch, API_MODE } from './client';
import { Transformation, TransformationCreateRequest, TransformationCreateResponse } from '@/types/transformation';
import { mockTransformations } from './mock/mockData';

export const transformationsApi = {
  create: async (data: TransformationCreateRequest): Promise<TransformationCreateResponse> => {
    if (API_MODE === 'mock') {
      const id = 'trans_' + Date.now();
      return {
        transformation_id: id,
        job_id: id,
        status: 'queued',
      };
    }
    return apiFetch<TransformationCreateResponse>('/transformations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (projectId?: string): Promise<Transformation[]> => {
    if (API_MODE === 'mock') return mockTransformations;
    const query = projectId ? `?project_id=${projectId}` : '';
    try {
      return await apiFetch<Transformation[]>(`/transformations${query}`);
    } catch {
      return mockTransformations;
    }
  },

  get: async (id: string): Promise<Transformation> => {
    if (API_MODE === 'mock') {
      return mockTransformations.find(t => t.id === id) || mockTransformations[0];
    }
    try {
      return await apiFetch<Transformation>(`/transformations/${id}`);
    } catch {
      return mockTransformations.find(t => t.id === id) || mockTransformations[0];
    }
  },

  getICO: async (id: string): Promise<any> => {
    if (API_MODE === 'mock') {
      const trans = mockTransformations.find(t => t.id === id) || mockTransformations[0];
      return {
        transformation_id: id,
        version: 1,
        status: 'approved',
        detected_intent: 'security_alert',
        ico: trans.central_context
      };
    }
    return apiFetch<any>(`/transformations/${id}/ico`);
  },

  updateICO: async (id: string, data: Record<string, any>): Promise<any> => {
    if (API_MODE === 'mock') {
      return { message: 'ICO updated', version: 2, status: 'review' };
    }
    return apiFetch<any>(`/transformations/${id}/ico`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  approveICO: async (id: string): Promise<any> => {
    if (API_MODE === 'mock') {
      return { message: 'ICO approved', version: 1, status: 'approved' };
    }
    return apiFetch<any>(`/transformations/${id}/ico/approve`, {
      method: 'POST',
    });
  },

  triggerGeneration: async (id: string): Promise<any> => {
    if (API_MODE === 'mock') {
      return { message: 'Generation triggered', transformation_id: id, status: 'running' };
    }
    return apiFetch<any>(`/transformations/${id}/generate`, {
      method: 'POST',
    });
  },
};

