import api from '../../shared/lib/axios';
import type { Dentista, DentistaFormData, DentistaPageParams, SliceResponse } from './types';

const BASE = '/dentistas';

export const dentistaService = {
  listar: async (params: DentistaPageParams): Promise<SliceResponse<Dentista>> => {
    const { data } = await api.get(BASE, { params });
    return data;
  },

  buscarPorId: async (id: number): Promise<Dentista> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: DentistaFormData): Promise<Dentista> => {
    const { data } = await api.post(BASE, {
      ...payload,
      perfil: 'DENTISTA',
      isAtivo: true,
    });
    return data;
  },

  atualizar: async (id: number, payload: Partial<DentistaFormData>): Promise<Dentista> => {
    const { data } = await api.put(`${BASE}/${id}`, payload);
    return data;
  },

  toggleAtivo: async (id: number, isAtivo: boolean): Promise<Dentista> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, { isAtivo });
    return data;
  },
};
