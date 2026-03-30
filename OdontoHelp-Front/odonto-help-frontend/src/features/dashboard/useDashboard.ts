import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboardService';

export function useDashboardResumo() {
  return useQuery({
    queryKey: ['dashboard', 'resumo'],
    queryFn: dashboardService.resumo,
    staleTime: 1000 * 60, // 1 min
  });
}

export function useAgendamentosPorStatus(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: ['dashboard', 'status', dataInicio, dataFim],
    queryFn: () => dashboardService.agendamentosPorStatus(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
  });
}

export function useProximosHoje() {
  return useQuery({
    queryKey: ['dashboard', 'proximos'],
    queryFn: dashboardService.proximosHoje,
    staleTime: 1000 * 30, // 30s
  });
}
