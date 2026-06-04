import type { PerfilUsuario } from '../shared/store/authStore';

export type AppRole = PerfilUsuario;

const PERFIS: PerfilUsuario[] = ['ADMIN', 'DENTISTA', 'RECEPCAO', 'PACIENTE'];

/** Aceita string, enum serializado como objeto, ou valor legado no sessionStorage. */
export function normalizePerfil(raw: unknown): PerfilUsuario | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const key = raw.trim().toUpperCase();
    return PERFIS.includes(key as PerfilUsuario) ? (key as PerfilUsuario) : null;
  }
  if (typeof raw === 'object') {
    const obj = raw as { name?: string; value?: string };
    if (obj.name) return normalizePerfil(obj.name);
    if (obj.value) return normalizePerfil(obj.value);
  }
  return null;
}

export function canFilterByDentista(perfil: unknown): boolean {
  const p = normalizePerfil(perfil);
  return p === 'ADMIN' || p === 'RECEPCAO';
}

export function hasAnyRole(role: unknown, allowed: AppRole[]) {
  const normalized = normalizePerfil(role);
  return !!normalized && allowed.includes(normalized);
}

export function roleHomePath(role: unknown): string {
  if (normalizePerfil(role) === 'DENTISTA') return '/agendamentos';
  return '/dashboard';
}
