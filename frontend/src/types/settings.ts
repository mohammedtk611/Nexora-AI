export interface Settings {
  app_name: string;
  environment: string;
  llm_provider: string;
  gemini_model: string;
  gemini_fast_model: string;
  ollama_base_url: string;
  ollama_model: string;
  qdrant_url: string;
  qdrant_collection: string;
  has_gemini_api_key: boolean;
}

export interface SettingsUpdateRequest {
  llm_provider?: string;
  gemini_model?: string;
  gemini_fast_model?: string;
  ollama_base_url?: string;
  ollama_model?: string;
}
