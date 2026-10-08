import { apiFetch, API_MODE } from './client';
import { Settings, SettingsUpdateRequest } from '@/types/settings';

export const settingsApi = {
  get: async (): Promise<Settings> => {
    if (API_MODE === 'mock') {
      return {
        app_name: 'Nexora',
        environment: 'development',
        llm_provider: 'gemini',
        gemini_model: 'gemini-2.5-flash',
        gemini_fast_model: 'gemini-2.5-flash',
        ollama_base_url: 'http://localhost:11434',
        ollama_model: 'llama3.1:8b',
        qdrant_url: 'http://localhost:6333',
        qdrant_collection: 'nexora_kb',
        has_gemini_api_key: true,
      };
    }
    try {
      return await apiFetch<Settings>('/settings');
    } catch {
      return {
        app_name: 'Nexora',
        environment: 'development',
        llm_provider: 'gemini',
        gemini_model: 'gemini-2.5-flash',
        gemini_fast_model: 'gemini-2.5-flash',
        ollama_base_url: 'http://localhost:11434',
        ollama_model: 'llama3.1:8b',
        qdrant_url: 'http://localhost:6333',
        qdrant_collection: 'nexora_kb',
        has_gemini_api_key: true,
      };
    }
  },

  update: async (data: SettingsUpdateRequest): Promise<Settings> => {
    if (API_MODE === 'mock') {
      const current = await settingsApi.get();
      return { ...current, ...data };
    }
    try {
      return await apiFetch<Settings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch {
      const current = await settingsApi.get();
      return { ...current, ...data };
    }
  },
};
