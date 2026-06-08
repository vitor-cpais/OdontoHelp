// src/shared/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizePerfil } from '../../permissions/roles';

export type PerfilUsuario = 'ADMIN' | 'DENTISTA' | 'RECEPCAO' | 'PACIENTE';

export interface AuthUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  dentistaId: number | null;
  onboardingConcluido: boolean;
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
  patchUsuario: (partial: Partial<AuthUsuario>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,

      setAuth: ({ accessToken, refreshToken, usuario }) =>
        set({
          accessToken,
          refreshToken,
          usuario: {
            ...usuario,
            perfil: normalizePerfil(usuario.perfil) ?? usuario.perfil,
            onboardingConcluido: usuario.onboardingConcluido ?? false,
          },
        }),

      patchUsuario: (partial) =>
        set((state) => ({
          usuario: state.usuario ? { ...state.usuario, ...partial } : null,
        })),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, usuario: null }),
    }),
    {
      name: 'odonto-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
