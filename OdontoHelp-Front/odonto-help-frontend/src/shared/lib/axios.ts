// src/shared/lib/axios.ts
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

// ─── instância base ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// ─── fila de requests pendentes durante o refresh ────────────────────────────
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

// ─── interceptor de REQUEST — injeta Bearer token ────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── interceptor de RESPONSE — erros de negócio + refresh de 401 ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const message = (error.response?.data as any)?.erro 
             ?? (error.response?.data as any)?.message 
             ?? 'Erro inesperado';

    // ── erros de negócio (sem retry) ──
    if (status === 404) return Promise.reject(new Error('Recurso não encontrado'));
    if (status === 409) return Promise.reject(new Error(message));
    if (status === 422) return Promise.reject(new Error(message));
    if (status !== undefined && status >= 500)
      return Promise.reject(new Error('Erro no servidor — tente novamente'));

    // ── 401: tenta refresh, exceto nas rotas de auth ──
    const url = original?.url ?? '';
    if (status !== 401 || url.includes('/auth/')) {
      return Promise.reject(error);
    }

    // se já tentou refresh e falhou de novo → logout
    if (original._retry) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // se já há um refresh em andamento, enfileira
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        })
        .catch(Promise.reject.bind(Promise));
    }

    original._retry = true;
    isRefreshing = true;

    const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        usuario: data.usuario,
      });

      processQueue(null, data.accessToken);
      original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
