// src/features/procedimentos/useProcedimentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procedimentoService } from './procedimentoService';
import type { ProcedimentoFormData, ProcedimentoPageParams } from './types';

export const PROCEDIMENTOS_KEY = 'procedimentos';

export function useProcedimentos(params: ProcedimentoPageParams) {
  return useQuery({
    queryKey: [PROCEDIMENTOS_KEY, params],
    queryFn: () => procedimentoService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useProcedimento(id: number | null) {
  return useQuery({
    queryKey: [PROCEDIMENTOS_KEY, id],
    queryFn: () => procedimentoService.buscarPorId(id!),
    enabled: id !== null,
  });
}

/** Lista simplificada para selects — todos ativos, sem paginação visível */
export function useProcedimentosAtivos() {
  return useQuery({
    queryKey: [PROCEDIMENTOS_KEY, 'ativos'],
    queryFn: () => procedimentoService.listar({ page: 0, size: 200, isAtivo: true }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProcedimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedimentoFormData) => procedimentoService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROCEDIMENTOS_KEY] }),
  });
}

export function useUpdateProcedimento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProcedimentoFormData) => procedimentoService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROCEDIMENTOS_KEY] }),
  });
}

export function useToggleAtivoProcedimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAtivo }: { id: number; isAtivo: boolean }) =>
      procedimentoService.toggleAtivo(id, isAtivo),
    onSuccess: (updated) => {
      qc.setQueriesData({ queryKey: [PROCEDIMENTOS_KEY] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((p: any) => (p.id === updated.id ? updated : p)),
        };
      });
    },
  });
}
