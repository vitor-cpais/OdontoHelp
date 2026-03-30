import api from '../../shared/lib/axios';
import type { Agendamento, AgendamentoFormData, AgendamentoPageParams, StatusConsulta } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE = '/agendamentos';

const formatDT = (dt: string) => dt.length === 16 ? `${dt}:00` : dt;

export const agendamentoService = {
  listar: async (params: AgendamentoPageParams): Promise<SliceResponse<Agendamento>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.dataInicio) query.set('dataInicio', `${params.dataInicio}T00:00:00`);
    if (params.dataFim) query.set('dataFim', `${params.dataFim}T23:59:59`);
    if (params.status) query.set('status', params.status);
    if (params.dentistaId) query.set('dentistaId', String(params.dentistaId));
    if (params.pacienteId) query.set('pacienteId', String(params.pacienteId));
    if (params.nome) query.set('nome', params.nome);
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Agendamento> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: AgendamentoFormData): Promise<Agendamento> => {
    const { data } = await api.post(BASE, {
      pacienteId: payload.pacienteId,
      dentistaId: payload.dentistaId,
      dataInicio: formatDT(payload.dataInicio),
      dataFim: formatDT(payload.dataFim),
      observacoes: payload.observacoes,
    });
    return data;
  },

  atualizar: async (id: number, payload: Partial<AgendamentoFormData>): Promise<Agendamento> => {
    const { data } = await api.put(`${BASE}/${id}`, {
      dataInicio: payload.dataInicio ? formatDT(payload.dataInicio) : undefined,
      dataFim: payload.dataFim ? formatDT(payload.dataFim) : undefined,
      observacoes: payload.observacoes,
    });
    return data;
  },

  atualizarStatus: async (id: number, status: StatusConsulta): Promise<Agendamento> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { status } });
    return data;
  },

  cancelar: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};
