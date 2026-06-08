import api from '../../shared/lib/axios';
import type { SliceResponse } from '../../shared/types/api';
import type {
  Agendamento,
  AgendamentoFormData,
  AgendamentoPageParams,
  StatusConsulta,
} from './agendamentos.types';

const BASE = '/agendamentos';

const formatDateTime = (dateTime: string) => (dateTime.length === 16 ? `${dateTime}:00` : dateTime);

export const agendamentosClient = {
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

  criar: async (payload: AgendamentoFormData, idempotencyKey?: string): Promise<Agendamento> => {
    const { data } = await api.post(BASE, {
      pacienteId: payload.pacienteId,
      dentistaId: payload.dentistaId,
      dataInicio: formatDateTime(payload.dataInicio),
      dataFim: formatDateTime(payload.dataFim),
      observacoes: payload.observacoes,
    }, { idempotencyKey });
    return data;
  },

  atualizar: async (id: number, payload: Partial<AgendamentoFormData>): Promise<Agendamento> => {
    const { data } = await api.put(`${BASE}/${id}`, {
      dataInicio: payload.dataInicio ? formatDateTime(payload.dataInicio) : undefined,
      dataFim: payload.dataFim ? formatDateTime(payload.dataFim) : undefined,
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
