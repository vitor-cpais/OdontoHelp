// src/features/procedimentos/procedimentoService.ts
import api from '../../shared/lib/axios';
import type { Procedimento, ProcedimentoFormData, ProcedimentoPageParams } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE = '/procedimentos';

export const procedimentoService = {
  listar: async (params: ProcedimentoPageParams): Promise<SliceResponse<Procedimento>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.nome) query.set('nome', params.nome);
    if (params.isAtivo !== undefined) query.set('isAtivo', String(params.isAtivo));
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Procedimento> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: ProcedimentoFormData): Promise<Procedimento> => {
    const { data } = await api.post(BASE, {
      nome: payload.nome,
      descricao: payload.descricao || null,
      valorBase: Number(payload.valorBase),
      duracaoMinutos: Number(payload.duracaoMinutos),
      corLegenda: payload.corLegenda || null,
    });
    return data;
  },

  atualizar: async (id: number, payload: ProcedimentoFormData): Promise<Procedimento> => {
    const { data } = await api.put(`${BASE}/${id}`, {
      nome: payload.nome,
      descricao: payload.descricao || null,
      valorBase: Number(payload.valorBase),
      duracaoMinutos: Number(payload.duracaoMinutos),
      corLegenda: payload.corLegenda || null,
    });
    return data;
  },

  toggleAtivo: async (id: number, isAtivo: boolean): Promise<Procedimento> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { isAtivo } });
    return data;
  },
};
