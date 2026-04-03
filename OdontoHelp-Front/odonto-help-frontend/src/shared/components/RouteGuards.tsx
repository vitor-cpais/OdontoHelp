// src/shared/components/RouteGuards.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { PerfilUsuario } from '../store/authStore';
import { homeByPerfil } from '../../features/auth/useAuth';

/**
 * PrivateRoute — redireciona para /login se não houver token.
 * Preserva a URL de destino em `state.from` para redirect pós-login.
 */
export function PrivateRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * RoleRoute — restringe rotas por perfil.
 * Se o perfil não tiver permissão, redireciona para a home do perfil.
 */
interface RoleRouteProps {
  allowed: PerfilUsuario[];
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);

  if (!usuario) return <Navigate to="/login" replace />;

  if (!allowed.includes(usuario.perfil)) {
    return <Navigate to={homeByPerfil(usuario.perfil)} replace />;
  }

  return <Outlet />;
}
