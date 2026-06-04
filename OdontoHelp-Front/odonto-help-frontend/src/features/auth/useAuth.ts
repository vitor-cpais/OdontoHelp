// src/features/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginPayload } from './authService';
import { useAuthStore } from '../../shared/store/authStore';
import { roleHomePath } from '../../permissions';
import queryClient from '../../app/queryClient';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data);
      navigate(roleHomePath(data.usuario.perfil), { replace: true });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: async () => {
      // Limpa o cache de queries para evitar vazamento de dados
      await queryClient.cancelQueries();
      queryClient.clear();

      // Limpa autenticação
      clearAuth();

      // Redireciona para login
      navigate('/login', { replace: true });
    },
  });
}
