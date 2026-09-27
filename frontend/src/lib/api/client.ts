import { APIErrorResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_MODE = import.meta.env.VITE_API_MODE || 'real';

export class APIClientError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
  requestId?: string;

  constructor(code: string, message: string, statusCode: number, details?: Record<string, any>, requestId?: string) {
    super(message);
    this.name = 'APIClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('revamp_ai_jwt');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/api/v1${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData: APIErrorResponse | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Failed to parse JSON error
      }

      const code = errorData?.error?.code || `HTTP_${response.status}`;
      const message = errorData?.error?.message || getStatusMessage(response.status);
      const details = errorData?.error?.details;
      const requestId = errorData?.error?.request_id || response.headers.get('X-Request-ID') || undefined;

      if (response.status === 401) {
        localStorage.removeItem('revamp_ai_jwt');
      }

      throw new APIClientError(code, message, response.status, details, requestId);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: any) {
    if (err instanceof APIClientError) {
      throw err;
    }
    throw new APIClientError('NETWORK_ERROR', err.message || 'Failed to connect to backend server', 503);
  }
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request. Please check input parameters.';
    case 401: return 'Authentication required. Please log in again.';
    case 403: return 'Access denied. You do not have permission.';
    case 404: return 'Requested resource was not found.';
    case 409: return 'Conflict occurred while processing request.';
    case 413: return 'Uploaded payload or file exceeds size limit.';
    case 422: return 'Validation error in request format.';
    case 429: return 'Rate limit reached. Please wait before retrying.';
    case 500: return 'Internal server error. Please try again later.';
    case 502: return 'Bad gateway connection to backend service.';
    case 503: return 'Service temporarily unavailable.';
    case 504: return 'Gateway timeout while processing request.';
    default: return 'An unexpected API error occurred.';
  }
}
