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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  novaSenha: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await api.post('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await api.post('/auth/reset-password', payload);
  },

  logout: async (): Promise<void> => {
    // Bearer é injetado automaticamente pelo interceptor
    await api.post('/auth/logout');
  },

  concluirOnboarding: async (): Promise<void> => {
    await api.post('/auth/onboarding/concluir');
  },
};
