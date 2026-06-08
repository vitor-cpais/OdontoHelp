import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planoTratamentoService } from '../../features/planoTratamento/planoTratamentoService';
import { agendamentosClient } from './agendamentos.client';
import { agendamentosKeys } from './agendamentos.keys';
import type { AgendamentoFormData, StatusConsulta } from './agendamentos.types';

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, idempotencyKey }: { data: AgendamentoFormData; idempotencyKey?: string }) =>
      agendamentosClient.criar(data, idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendamentosKeys.all }),
  });
}

export function useUpdateAgendamento(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AgendamentoFormData>) => agendamentosClient.atualizar(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendamentosKeys.all }),
  });
}

export function useAtualizarStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusConsulta }) =>
      agendamentosClient.atualizarStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendamentosKeys.all }),
  });
}

export function useCancelarAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agendamentosClient.cancelar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendamentosKeys.all }),
  });
}

export function useAtualizarStatusAgendamentoComItens() {
  const queryClient = useQueryClient();
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
      await agendamentosClient.atualizarStatus(agendamentoId, status);

      if (status === 'ATENDIDO') {
        const planos = await planoTratamentoService.listarPorPaciente(pacienteId, 0, 100);

        for (const plano of planos.content) {
          for (const item of plano.itens) {
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
      queryClient.invalidateQueries({ queryKey: agendamentosKeys.all });
      queryClient.invalidateQueries({ queryKey: ['planosTratamento'] });
    },
  });
}
