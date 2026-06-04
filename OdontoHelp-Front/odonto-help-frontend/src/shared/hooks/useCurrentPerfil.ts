import { useMemo } from 'react';
import { useAuthStore, type PerfilUsuario } from '../store/authStore';
import { decodeJWT } from '../lib/jwt';
import { normalizePerfil } from '../../permissions/roles';

/** Perfil efetivo: store persistido ou claim `perfil` do JWT. */
export function useCurrentPerfil(): PerfilUsuario | null {
  const usuario = useAuthStore((s) => s.usuario);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMemo(() => {
    const fromUsuario = normalizePerfil(usuario?.perfil);
    if (fromUsuario) return fromUsuario;
    if (accessToken) return normalizePerfil(decodeJWT(accessToken)?.perfil);
    return null;
  }, [usuario?.perfil, accessToken]);
}
