import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { clearApiAccessToken, getApiAccessToken } from "./accessToken";

type AuthRetryConfig = InternalAxiosRequestConfig & {
  authRetryAttempted?: boolean;
};

const viteEnv = (
  typeof import.meta !== "undefined" &&
  import.meta &&
  typeof import.meta.env !== "undefined"
    ? import.meta.env
    : undefined
) as { VITE_API_BASE_URL?: string } | undefined;
const runtimeEnv =
  typeof globalThis !== "undefined"
    ? (
        globalThis as typeof globalThis & {
          process?: { env?: Record<string, string | undefined> };
        }
      ).process?.env
    : undefined;
const apiBaseUrl =
  viteEnv?.VITE_API_BASE_URL || runtimeEnv?.VITE_API_BASE_URL || "/";

const apiClient = axios.create({
  baseURL: apiBaseUrl || "/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const requestUrl = config.url ?? "";
  const requiresAccessToken =
    /\/v1\/(?:search(?:\/|$)|candidate\/|resume\/|embeddings(?:\/|$))/.test(
      requestUrl,
    );
  if (requiresAccessToken) {
    config.headers.Authorization = `Bearer ${getApiAccessToken()}`;
  }

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    config.headers["X-Request-ID"] = crypto.randomUUID();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearApiAccessToken();
      const config = error.config as AuthRetryConfig | undefined;
      if (config && !config.authRetryAttempted) {
        config.authRetryAttempted = true;
        try {
          config.headers.Authorization = `Bearer ${getApiAccessToken(
            "The previous token was rejected. Enter the current API_ACCESS_TOKEN from the project .env file.",
          )}`;
          return apiClient.request(config);
        } catch (promptError) {
          return Promise.reject(promptError);
        }
      }
    }
    const message =
      error.response?.status === 401
        ? "Access token rejected. Use the current API_ACCESS_TOKEN from .env and restart the backend if you changed it."
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Request failed";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
