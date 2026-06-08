import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    idempotencyKey?: string;
  }
}
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from './jwt';
import { getApiErrorMessage } from './axios';

const financeiroApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_FINANCEIRO_API_URL || 'http://localhost:8081',
  timeout: 15000,
});

function clearSessionAndRedirect() {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}

type FailedRequest = { resolve: (token: string) => void; reject: (err: unknown) => void };
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => { if (error) p.reject(error); else p.resolve(token!); });
  failedQueue = [];
}

financeiroApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && !isTokenExpired(accessToken, 30_000)) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (config.data != null && config.method && !['get', 'head'].includes(config.method)) {
    config.headers = config.headers || {};
    if (!('Content-Type' in config.headers)) config.headers['Content-Type'] = 'application/json';
  }

  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    config.headers = config.headers || {};
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = config.idempotencyKey ?? crypto.randomUUID();
    }
  }

  return config;
});

financeiroApi.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const message = getApiErrorMessage(error, 'Erro no financeiro');

    if (status === 400) return Promise.reject(new Error(message));
    if (status === 403) return Promise.reject(new Error(message || 'Você não tem permissão para realizar esta ação'));
    if (status === 404) return Promise.reject(new Error('Recurso não encontrado'));
    if (status === 409) return Promise.reject(new Error(message));
    if (status === 422) return Promise.reject(new Error(message));
    if (status === 429) return Promise.reject(new Error(message || 'Muitas tentativas. Aguarde e tente novamente'));
    if (status !== undefined && status >= 500) {
      return Promise.reject(new Error('Erro no servidor — tente novamente'));
    }

    if (status !== 401) return Promise.reject(new Error(message));

    if (original._retry) {
      return Promise.reject(new Error(message || 'Sessão expirada'));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => { failedQueue.push({ resolve, reject }); })
        .then((token) => {
          original.headers = original.headers || {};
          original.headers['Authorization'] = `Bearer ${token}`;
          return financeiroApi(original);
        })
        .catch((err) => Promise.reject(err instanceof Error ? err : new Error(message)));
    }

    original._retry = true;
    isRefreshing = true;

    const { refreshToken, setAuth } = useAuthStore.getState();
    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(new Error('Sessão expirada'));
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, usuario: data.usuario });
      processQueue(null, data.accessToken);
      original.headers = original.headers || {};
      original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return financeiroApi(original);
    } catch {
      clearSessionAndRedirect();
      return Promise.reject(new Error('Sessão expirada'));
    } finally {
      isRefreshing = false;
    }
  },
);

export default financeiroApi;
