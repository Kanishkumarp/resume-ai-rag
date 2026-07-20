export const apiConfig = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000',
  timeout: 30000,
  defaultMode: 'hybrid' as const,
};
