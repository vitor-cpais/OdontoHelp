import { useQuery } from '@tanstack/react-query';
import { agendamentosClient } from './agendamentos.client';
import { agendamentosKeys } from './agendamentos.keys';
import type { AgendamentoPageParams } from './agendamentos.types';

export function useAgendamentos(params: AgendamentoPageParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: agendamentosKeys.list(params),
    queryFn: () => agendamentosClient.listar(params),
    placeholderData: (previousData) => previousData,
    enabled: options?.enabled ?? true,
  });
}

export function useAgendamento(id: number | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: id ? agendamentosKeys.detail(id) : agendamentosKeys.details(),
    queryFn: () => agendamentosClient.buscarPorId(id!),
    enabled: (options?.enabled ?? true) && !!id,
  });
}
