import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dentistaService } from './dentistaService';
import type { DentistaFormData, DentistaPageParams } from './types';

export const DENTISTAS_KEY = 'dentistas';

export function useDentistas(params: DentistaPageParams) {
  return useQuery({
    queryKey: [DENTISTAS_KEY, params],
    queryFn: () => dentistaService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useDentista(id: number | null) {
  return useQuery({
    queryKey: [DENTISTAS_KEY, id],
    queryFn: () => dentistaService.buscarPorId(id!),
    enabled: id !== null,
  });
}

export function useCreateDentista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DentistaFormData) => dentistaService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DENTISTAS_KEY] }),
  });
}

export function useUpdateDentista(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DentistaFormData>) => dentistaService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DENTISTAS_KEY] }),
  });
}

export function useToggleAtivoDentista() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAtivo }: { id: number; isAtivo: boolean }) =>
      dentistaService.toggleAtivo(id, isAtivo),
    onSuccess: (dentistaAtualizado) => {
      qc.setQueriesData({ queryKey: [DENTISTAS_KEY] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((d: any) =>
            d.id === dentistaAtualizado.id ? dentistaAtualizado : d
          ),
        };
      });
    },
  });
}
