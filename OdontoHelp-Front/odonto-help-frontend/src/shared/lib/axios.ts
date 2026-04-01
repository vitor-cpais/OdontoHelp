import axios from 'axios';

// URLs fixas para o fallback
const LOCAL_URL = 'http://localhost:8080/';
const PRODUCTION_URL = import.meta.env.VITE_API_URL || 'https://odonto-help-api.onrender.com/';

const api = axios.create({
  // Começamos tentando o local por padrão no desenvolvimento
  baseURL: LOCAL_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Reduzi para 5s para o pulo pro Render não demorar tanto
});

// Interceptor de resposta — trata fallback e erros globais
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // 1. LÓGICA DE FALLBACK (Local -> Render)
    // Se não houve resposta do servidor (servidor local desligado) e ainda está no LOCAL_URL
    if (!error.response && config.baseURL === LOCAL_URL) {
      console.warn("⚠️ Localhost offline. Tentando API de Produção (Render)...");
      
      config.baseURL = PRODUCTION_URL;
      
      // Reinicia a requisição com a nova URL
      return api(config);
    }

    // 2. TRATAMENTO DE ERROS GLOBAIS (Seu código original)
    const status = error.response?.status;
    const message = error.response?.data?.message ?? 'Erro inesperado';

    // MVP 1.5: (Lembrete: O interceptor de REQUEST deve ficar FORA do interceptor de RESPONSE)
    
    if (status === 404) return Promise.reject(new Error('Recurso não encontrado'));
    if (status === 409) return Promise.reject(new Error(message));
    if (status === 422) return Promise.reject(new Error(message));
    if (status >= 500) return Promise.reject(new Error('Erro no servidor — tente novamente'));

    return Promise.reject(error);
  }
);

export default api;