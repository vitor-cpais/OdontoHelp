import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboardService';

export function useDashboardResumo(dentistaId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'resumo', dentistaId ?? 'todos'],
    queryFn: () => dashboardService.resumo(dentistaId),
    staleTime: 1000 * 60, // 1 min
  });
}

export function useAgendamentosPorStatus(dataInicio: string, dataFim: string, dentistaId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'status', dataInicio, dataFim, dentistaId ?? 'todos'],
    queryFn: () => dashboardService.agendamentosPorStatus(dataInicio, dataFim, dentistaId),
    enabled: !!dataInicio && !!dataFim,
  });
}

export function useProximosHoje(dentistaId?: number) {
  return useQuery({
    queryKey: ['dashboard', 'proximos', dentistaId ?? 'todos'],
    queryFn: () => dashboardService.proximosHoje(dentistaId),
    staleTime: 1000 * 30, // 30s
  });
}
