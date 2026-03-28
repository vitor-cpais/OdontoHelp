import api from '../../shared/lib/axios';
import type { Agendamento, AgendamentoFormData, AgendamentoPageParams, StatusConsulta } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE = '/agendamentos';

export const agendamentoService = {
  listar: async (params: AgendamentoPageParams): Promise<SliceResponse<Agendamento>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.dataInicio) query.set('dataInicio', params.dataInicio);
    if (params.dataFim) query.set('dataFim', params.dataFim);
    if (params.status) query.set('status', params.status);
    if (params.dentistaId) query.set('dentistaId', String(params.dentistaId));
    if (params.pacienteId) query.set('pacienteId', String(params.pacienteId));
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Agendamento> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: AgendamentoFormData): Promise<Agendamento> => {
    const { data } = await api.post(BASE, payload);
    return data;
  },

  atualizar: async (id: number, payload: Partial<AgendamentoFormData>): Promise<Agendamento> => {
    const { data } = await api.put(`${BASE}/${id}`, payload);
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
