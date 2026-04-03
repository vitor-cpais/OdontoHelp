
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PerfilUsuario = 'ADMIN' | 'DENTISTA' | 'RECEPCAO' | 'PACIENTE';

export interface AuthUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: AuthUsuario | null;
  setAuth: (params: {
    accessToken: string;
    refreshToken: string;
    usuario: AuthUsuario;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,

      setAuth: ({ accessToken, refreshToken, usuario }) =>
        set({ accessToken, refreshToken, usuario }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, usuario: null }),
    }),
    {
      name: 'odonto-auth', // chave no localStorage
    }
  )
);
