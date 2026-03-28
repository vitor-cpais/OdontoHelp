import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentoService } from './agendamentoService';
import type { AgendamentoFormData, AgendamentoPageParams, StatusConsulta } from './types';

export const AGENDAMENTOS_KEY = 'agendamentos';

export function useAgendamentos(params: AgendamentoPageParams) {
  return useQuery({
    queryKey: [AGENDAMENTOS_KEY, params],
    queryFn: () => agendamentoService.listar(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendamentoFormData) => agendamentoService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] }),
  });
}

export function useUpdateAgendamento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AgendamentoFormData>) => agendamentoService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] }),
  });
}

export function useAtualizarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusConsulta }) =>
      agendamentoService.atualizarStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] }),
  });
}

export function useCancelarAgendamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agendamentoService.cancelar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] }),
  });
}
