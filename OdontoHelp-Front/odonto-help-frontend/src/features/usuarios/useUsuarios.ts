// src/features/usuarios/useUsuarios.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from './usuarioService';
import type { UsuarioFormData, UsuarioPageParams } from './types';

export const USUARIOS_KEY = 'usuarios';

export function useUsuarios(params: UsuarioPageParams, options?: { staleTime?: number }) {
  return useQuery({
    queryKey: [USUARIOS_KEY, params],
    queryFn: () => usuarioService.listar(params),
    placeholderData: (prev) => prev,
    staleTime: options?.staleTime,
  });
}

export function useUsuario(id: number | null) {
  return useQuery({
    queryKey: [USUARIOS_KEY, id],
    queryFn: () => usuarioService.buscarPorId(id!),
    enabled: id !== null,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UsuarioFormData) => usuarioService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USUARIOS_KEY] }),
  });
}

export function useUpdateUsuario(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UsuarioFormData>) => usuarioService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USUARIOS_KEY] }),
  });
}

export function useToggleAtivoUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAtivo }: { id: number; isAtivo: boolean }) =>
      usuarioService.toggleAtivo(id, isAtivo),
    onSuccess: (usuarioAtualizado) => {
      qc.setQueriesData({ queryKey: [USUARIOS_KEY] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((u: any) =>
            u.id === usuarioAtualizado.id ? usuarioAtualizado : u
          ),
        };
      });
    },
  });
}
