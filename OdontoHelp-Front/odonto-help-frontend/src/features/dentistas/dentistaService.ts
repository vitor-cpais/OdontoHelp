import api from '../../shared/lib/axios';
import type { Dentista, DentistaFormData, DentistaPageParams, SliceResponse } from './types';

const BASE = '/dentistas';

export const dentistaService = {
  listar: async (params: DentistaPageParams): Promise<SliceResponse<Dentista>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.nome) query.set('nome', params.nome);
    if (params.isAtivo !== undefined) query.set('isAtivo', String(params.isAtivo));
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Dentista> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: DentistaFormData): Promise<Dentista> => {
    const { data } = await api.post(BASE, {
      ...payload,
      cpf: payload.cpf.replace(/\D/g, ''),
      telefone: payload.telefone.replace(/\D/g, ''),
      perfil: 'DENTISTA',
      isAtivo: true,
    });
    return data;
  },

  atualizar: async (id: number, payload: Partial<DentistaFormData>): Promise<Dentista> => {
    const { data } = await api.put(`${BASE}/${id}`, {
      ...payload,
      cpf: payload.cpf?.replace(/\D/g, ''),
      telefone: payload.telefone?.replace(/\D/g, ''),
    });
    return data;
  },
  

    toggleAtivo: async (id: number, isAtivo: boolean): Promise<Dentista> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { isAtivo } });
  return data;
  },
};
