
import api from '../../shared/lib/axios';
import type { PlanoDeTratamento, PlanoFormData, StatusItemPlano } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE = '/planos-tratamento';

export const planoTratamentoService = {
  listarPorPaciente: async (
    pacienteId: number,
    page = 0,
    size = 10,
  ): Promise<SliceResponse<PlanoDeTratamento>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(`${BASE}/paciente/${pacienteId}?${query}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<PlanoDeTratamento> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: PlanoFormData): Promise<PlanoDeTratamento> => {
    const { data } = await api.post(BASE, {
      pacienteId:    payload.pacienteId,
      dentistaId:    payload.dentistaId,
      atendimentoId: payload.atendimentoId || null,
      observacoes:   payload.observacoes || null,
      itens: payload.itens.map((item) => ({
        procedimentoId: item.procedimentoId,
        numeroDente:    item.numeroDente,
        prioridade:     item.prioridade || 2,
        observacao:     item.observacao || null,
      })),
    });
    return data;
  },

  // CORREÇÃO: backend usa @RequestParam, não @RequestBody
  // PATCH /planos-tratamento/{id}/observacoes?observacoes=texto
  atualizarObservacoes: async (id: number, observacoes: string): Promise<PlanoDeTratamento> => {
    const { data } = await api.patch(`${BASE}/${id}/observacoes`, null, {
      params: { observacoes },
    });
    return data;
  },

  // CORREÇÃO: backend usa @RequestParam para status e atendimentoRealizacaoId
  // PATCH /planos-tratamento/{planoId}/itens/{itemId}/status?status=REALIZADO
  atualizarStatusItem: async (
    planoId: number,
    itemId: number,
    status: StatusItemPlano,
    atendimentoRealizacaoId?: number | null,
  ): Promise<PlanoDeTratamento> => {
    const params: Record<string, string> = { status };
    if (atendimentoRealizacaoId != null)
      params.atendimentoRealizacaoId = String(atendimentoRealizacaoId);

    const { data } = await api.patch(
      `${BASE}/${planoId}/itens/${itemId}/status`,
      null,
      { params },
    );
    return data;
  },
};
