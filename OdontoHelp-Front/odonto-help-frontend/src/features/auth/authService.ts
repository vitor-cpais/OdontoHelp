// src/features/auth/authService.ts
import api from '../../shared/lib/axios';
import { type AuthUsuario } from '../../shared/store/authStore';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUsuario;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    // Bearer é injetado automaticamente pelo interceptor
    await api.post('/auth/logout');
  },
};
