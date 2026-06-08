import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    idempotencyKey?: string;
  }
}
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from './jwt';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

function clearSessionAndRedirect() {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}

export function getApiErrorMessage(error: unknown, fallback = 'Erro inesperado') {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as any;
    if (responseData) {
      const backendMessage =
        responseData.message ?? responseData.erro ?? responseData.error ??
        responseData.detail ?? responseData.mensagem;
      if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage;
      if (responseData.fields && typeof responseData.fields === 'object') {
        const firstField = Object.values(responseData.fields).find((v) => typeof v === 'string');
        if (firstField) return String(firstField);
      }
      if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const first = responseData.errors[0];
        if (typeof first === 'string') return first;
        if (first?.message) return String(first.message);
      }
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return typeof error === 'string' ? error : fallback;
}

type FailedRequest = { resolve: (token: string) => void; reject: (err: unknown) => void };
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => { if (error) p.reject(error); else p.resolve(token!); });
  failedQueue = [];
}

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

function isPublicAuthRequest(url?: string) {
  return PUBLIC_AUTH_PATHS.some((path) => url?.startsWith(path));
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const publicAuth = isPublicAuthRequest(config.url);

  if (!publicAuth) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      if (isTokenExpired(accessToken)) {
        clearSessionAndRedirect();
        return Promise.reject(new Error('Sessão expirada'));
      }

      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
  }

  if (config.data != null && config.method && !['get', 'head'].includes(config.method)) {
    config.headers = config.headers || {};
    if (!('Content-Type' in config.headers)) config.headers['Content-Type'] = 'application/json';
  }

  if (
    config.method &&
    !['get', 'head', 'options'].includes(config.method) &&
    !publicAuth
  ) {
    config.headers = config.headers || {};
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = config.idempotencyKey ?? crypto.randomUUID();
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const message = getApiErrorMessage(error, 'Erro inesperado');
    const url = original?.url ?? '';

    if (status === 400) return Promise.reject(new Error(message));
    if (status === 403) return Promise.reject(new Error(message || 'Você não tem permissão para realizar esta ação'));
    if (status === 404) return Promise.reject(new Error('Recurso não encontrado'));
    if (status === 409) return Promise.reject(new Error(message));
    if (status === 422) return Promise.reject(new Error(message));
    if (status === 423) return Promise.reject(new Error(message || 'Conta temporariamente bloqueada'));
    if (status === 429) return Promise.reject(new Error(message || 'Muitas tentativas. Aguarde e tente novamente'));
    if (status !== undefined && status >= 500)
      return Promise.reject(new Error('Erro no servidor — tente novamente'));

    if (status !== 401 || url.includes('/auth/')) return Promise.reject(error);

    if (original._retry) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => { failedQueue.push({ resolve, reject }); })
        .then((token) => { original.headers['Authorization'] = `Bearer ${token}`; return api(original); })
        .catch(Promise.reject.bind(Promise));
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
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, usuario: data.usuario });
      processQueue(null, data.accessToken);
      original.headers = original.headers || {};
      original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
