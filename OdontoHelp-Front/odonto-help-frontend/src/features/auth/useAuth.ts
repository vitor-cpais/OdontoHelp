// src/features/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginPayload } from './authService';
import { useAuthStore, type PerfilUsuario } from '../../shared/store/authStore';

/** Rota home por perfil */
export function homeByPerfil(perfil: PerfilUsuario): string {
  if (perfil === 'DENTISTA') return '/agendamentos';
  return '/dashboard';
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data);
      navigate(homeByPerfil(data.usuario.perfil), { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // limpa mesmo se a chamada falhar (ex.: token já expirado)
      clearAuth();
      navigate('/login', { replace: true });
    },
  });
}
