import axios from 'axios';
import { apiBaseUrl } from './config';
import { getApiAccessToken } from './accessToken';

export const sessionClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  withCredentials: true,
});

let sessionPromise: Promise<void> | null = null;

const establishSession = async (): Promise<void> => {
  try {
    await sessionClient.post('/v1/auth/session');
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }

    const accessToken = getApiAccessToken();
    await sessionClient.post('/v1/auth/session', { accessToken });
  }
};

export const ensureApiSession = (): Promise<void> => {
  if (!sessionPromise) {
    sessionPromise = establishSession().catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
};

export const resetApiSession = (): void => {
  sessionPromise = null;
};
