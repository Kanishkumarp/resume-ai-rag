import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl } from './config';
import { ensureApiSession, resetApiSession } from './session';

type AuthRetryConfig = InternalAxiosRequestConfig & {
  authRetryAttempted?: boolean;
};

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const requestUrl = config.url ?? '';
  const requiresAccessToken =
    /\/v1\/(?:search(?:\/|$)|candidate\/|resume\/|embeddings(?:\/|$))/.test(
      requestUrl,
    );
  if (requiresAccessToken) {
    await ensureApiSession();
  }

  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    config.headers['X-Request-ID'] = crypto.randomUUID();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const config = error.config as AuthRetryConfig | undefined;
      if (config && !config.authRetryAttempted) {
        config.authRetryAttempted = true;
        resetApiSession();
        return apiClient.request(config);
      }
    }
    const message =
      error.response?.status === 401
        ? 'Access denied. If your session expired, configure a new one-time API_ACCESS_TOKEN.'
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
