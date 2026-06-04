import type { AgendamentoPageParams } from './agendamentos.types';

export const agendamentosKeys = {
  all: ['agendamentos'] as const,
  lists: () => [...agendamentosKeys.all, 'list'] as const,
  list: (params: AgendamentoPageParams) => [...agendamentosKeys.lists(), params] as const,
  details: () => [...agendamentosKeys.all, 'detail'] as const,
  detail: (id: number) => [...agendamentosKeys.details(), id] as const,
};

export const AGENDAMENTOS_KEY = agendamentosKeys.all[0];
