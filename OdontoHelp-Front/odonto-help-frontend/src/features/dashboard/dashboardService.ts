import api from '../../shared/lib/axios';
import { agendamentosClient } from '../../domains/agendamentos';
import type { Agendamento, StatusConsulta } from '../../domains/agendamentos';

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
  resumo: async (dentistaId?: number): Promise<DashboardResumo> => {
    const { data } = await api.get('/dashboard/resumo', {
      params: dentistaId ? { dentistaId } : undefined,
    });
    return data;
  },

  agendamentosPorStatus: async (
    dataInicio: string,
    dataFim: string,
    dentistaId?: number
  ): Promise<AgendamentoStatusDTO[]> => {
    const { data } = await api.get('/dashboard/agendamentos-por-status', {
      params: { dataInicio, dataFim, ...(dentistaId ? { dentistaId } : {}) },
    });
    return data;
  },

  proximosHoje: async (dentistaId?: number): Promise<Agendamento[]> => {
    const hoje = fmt(new Date());
    const data = await agendamentosClient.listar({
      page: 0,
      size: 20,
      dataInicio: hoje,
      dataFim: hoje,
      dentistaId,
    });
    return data.content
      .filter((agendamento) => agendamento.status === 'AGENDADO' || agendamento.status === 'CONFIRMADO')
      .slice(0, 5);
  },
};
