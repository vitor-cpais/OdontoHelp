import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planoTratamentoService } from './planoTratamentoService';
import type { PlanoFormData, StatusItemPlano, ItemPlano } from './types';

export const PLANO_KEY = 'planos-tratamento';

export function usePlanoUnico(pacienteId: number | null) {
  return useQuery({
    queryKey: [PLANO_KEY, 'unico', pacienteId],
    queryFn: () => planoTratamentoService.buscarPlanoUnico(pacienteId!),
    enabled: pacienteId !== null,
  });
}

export function usePlanosPorPaciente(pacienteId: number | null, page = 0) {
  return useQuery({
    queryKey: [PLANO_KEY, 'paciente', pacienteId, page],
    queryFn: () => planoTratamentoService.listarPorPaciente(pacienteId!, page),
    enabled: pacienteId !== null,
    placeholderData: (prev) => prev,
  });
}

export function usePlano(id: number | null) {
  return useQuery({
    queryKey: [PLANO_KEY, id],
    queryFn: () => planoTratamentoService.buscarPorId(id!),
    enabled: id !== null,
  });
}

export function useCreatePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanoFormData) => planoTratamentoService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANO_KEY] }),
  });
}

export function useAtualizarObservacoes(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (observacoes: string) => planoTratamentoService.atualizarObservacoes(id, observacoes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANO_KEY] }),
  });
}

export function useAtualizarStatusItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planoId, itemId, status,
    }: { planoId: number; itemId: number; status: StatusItemPlano }) =>
      planoTratamentoService.atualizarStatusItem(planoId, itemId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PLANO_KEY] }),
  });
}

export function useItensPlanoPendentes(pacienteId: number | null) {
  return useQuery({
    queryKey: [PLANO_KEY, 'pendentes', pacienteId],
    queryFn: () => planoTratamentoService.buscarItensPendentes(pacienteId!),
    enabled: pacienteId !== null,
    staleTime: 30_000,
  });
}
