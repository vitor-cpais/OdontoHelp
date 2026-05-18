import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendamentoService } from './agendamentoService';
import { planoTratamentoService } from '../planoTratamento/planoTratamentoService';
import type { AgendamentoFormData, AgendamentoPageParams, StatusConsulta } from './types';

export const AGENDAMENTOS_KEY = 'agendamentos';

export function useAgendamentos(params: AgendamentoPageParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [AGENDAMENTOS_KEY, params],
    queryFn: () => agendamentoService.listar(params),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
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

// Quando agendamento muda para ATENDIDO, marca itens do plano como REALIZADO
export function useAtualizarStatusAgendamentoComItens() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agendamentoId,
      pacienteId,
      status,
    }: {
      agendamentoId: number;
      pacienteId: number;
      status: StatusConsulta;
    }) => {
      // 1. Atualizar status do agendamento
      await agendamentoService.atualizarStatus(agendamentoId, status);

      // 2. Se for ATENDIDO, atualizar itens do plano relacionados
      if (status === 'ATENDIDO') {
        const planos = await planoTratamentoService.listarPorPaciente(pacienteId, 0, 100);
        
        for (const plano of planos.content) {
          for (const item of plano.itens) {
            // Atualizar itens que têm atendimentoId = agendamentoId
            if (item.atendimentoRealizacaoId === null && item.atendimentoId === agendamentoId) {
              await planoTratamentoService.atualizarStatusItem(
                plano.id,
                item.id,
                'REALIZADO',
                agendamentoId,
              );
            }
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] });
      // Invalida todos os planos para recarregar
      qc.invalidateQueries({ queryKey: ['planosTratamento'] });
    },
  });
}
