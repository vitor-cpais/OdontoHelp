// src/shared/components/RouteGuards.tsx
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { PerfilUsuario } from '../store/authStore';
import { hasAnyRole, roleHomePath } from '../../permissions';
import { isTokenExpired } from '../lib/jwt';

const TOKEN_EXPIRY_MARGIN_MS = 30 * 1000;

/**
 * PrivateRoute — redireciona para /login se não houver token.
 * Preserva a URL de destino em `state.from` para redirect pós-login.
 */
export function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();
  const tokenExpired = !!accessToken && isTokenExpired(accessToken, TOKEN_EXPIRY_MARGIN_MS);

  useEffect(() => {
    if (accessToken && tokenExpired) {
      clearAuth();
    }
  }, [accessToken, tokenExpired, clearAuth]);

  if (!accessToken || tokenExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

interface RoleRouteProps {
  allowed: PerfilUsuario[];
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const tokenExpired = !!accessToken && isTokenExpired(accessToken, TOKEN_EXPIRY_MARGIN_MS);

  useEffect(() => {
    if (accessToken && tokenExpired) {
      clearAuth();
    }
  }, [accessToken, tokenExpired, clearAuth]);

  if (!usuario || !accessToken || tokenExpired) return <Navigate to="/login" replace />;

  if (!hasAnyRole(usuario.perfil, allowed)) {
    return <Navigate to={roleHomePath(usuario.perfil)} replace />;
  }

  return <Outlet />;
}

/** Redireciona URLs inexistentes para login (sem sessão) ou home do perfil. */
export function NotFoundRedirect() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const usuario = useAuthStore((s) => s.usuario);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(usuario?.perfil)} replace />;
}
