// src/features/auth/useTokenRefresh.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../shared/store/authStore';
import { getTokenExpiry } from '../../shared/lib/jwt';

/**
 * Hook que gerencia renovação proativa do token.
 * - Verifica a cada 5 minutos se o token expira em menos de 10 minutos
 * - Se sim, tenta renovar proativamente
 * - Se o token expirou ou refresh falhou, faz logout
 * - Também renova quando o usuário volta para a aba (window focus)
 */
export function useTokenRefresh() {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore((s) => ({
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    setAuth: s.setAuth,
    clearAuth: s.clearAuth,
  }));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshingRef = useRef(false);

  const redirectToLogin = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const checkAndRefresh = async () => {
    if (!accessToken || !refreshToken) return;
    if (refreshingRef.current) return;

    const expiresAt = getTokenExpiry(accessToken);
    if (!expiresAt) return;

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry < 60 * 1000) {
      try {
        refreshingRef.current = true;
        // Utiliza uma chamada direta para não triggar o interceptor de retry
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAuth({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            usuario: data.usuario,
          });
        } else if (response.status === 401 || response.status === 403) {
          redirectToLogin();
        }
      } catch (error) {
        console.warn('Não foi possível renovar token agora:', error);
      } finally {
        refreshingRef.current = false;
      }
    }
  };

  // Intervalo periódico: roda a cada 5 minutos
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    timerRef.current = setInterval(checkAndRefresh, 60 * 1000);

    checkAndRefresh();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [accessToken, refreshToken, setAuth, clearAuth]);

  // Listener para quando o usuário volta para a aba (window focus)
  useEffect(() => {
    const handleFocus = () => {
      checkAndRefresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [accessToken, refreshToken, setAuth, clearAuth]);
}
