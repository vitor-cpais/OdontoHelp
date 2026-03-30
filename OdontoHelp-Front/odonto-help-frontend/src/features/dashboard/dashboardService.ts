import api from '../../shared/lib/axios';
import type { StatusConsulta } from '../agendamentos/types';

export interface DashboardResumo {
  agendamentosHoje: number;
  pacientesAtivos: number;
  dentistasAtivos: number;
  agendamentosMes: number;
}

export interface AgendamentoStatusDTO {
  status: StatusConsulta;
  total: number;
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export const dashboardService = {
  resumo: async (): Promise<DashboardResumo> => {
    const { data } = await api.get('/dashboard/resumo');
    return data;
  },

  agendamentosPorStatus: async (dataInicio: string, dataFim: string): Promise<AgendamentoStatusDTO[]> => {
    const { data } = await api.get('/dashboard/agendamentos-por-status', {
      params: { dataInicio, dataFim },
    });
    return data;
  },

  proximosHoje: async () => {
    const hoje = fmt(new Date());
    const query = new URLSearchParams();
    query.set('page', '0');
    query.set('size', '5');
    query.set('dataInicio', `${hoje}T00:00:00`);
    query.set('dataFim', `${hoje}T23:59:59`);
    const { data } = await api.get(`/agendamentos?${query.toString()}`);
    return data.content;
  },
};
