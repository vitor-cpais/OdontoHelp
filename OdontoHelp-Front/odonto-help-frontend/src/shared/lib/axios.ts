import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

// Interceptor de resposta — trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? 'Erro inesperado';

    // MVP 1.5: adicionar interceptor de request aqui para injetar JWT
    // api.interceptors.request.use((config) => {
    //   const token = useAuthStore.getState().token;
    //   if (token) config.headers.Authorization = `Bearer ${token}`;
    //   return config;
    // });

    if (status === 404) return Promise.reject(new Error('Recurso não encontrado'));
    if (status === 409) return Promise.reject(new Error(message));
    if (status === 422) return Promise.reject(new Error(message));
    if (status >= 500) return Promise.reject(new Error('Erro no servidor — tente novamente'));

    return Promise.reject(error);
  }
);

export default api;
