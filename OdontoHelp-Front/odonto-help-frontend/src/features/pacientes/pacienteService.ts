import api from '../../shared/lib/axios';
import type { Paciente, PacienteFormData, PacientePageParams } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE = '/pacientes';

export const pacienteService = {
  listar: async (params: PacientePageParams): Promise<SliceResponse<Paciente>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.nome) query.set('nome', params.nome);
    if (params.isAtivo !== undefined) query.set('isAtivo', String(params.isAtivo));
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Paciente> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: PacienteFormData): Promise<Paciente> => {
    const { data } = await api.post(BASE, {
      ...payload,
      cpf: payload.cpf.replace(/\D/g, ''),
      telefone: payload.telefone.replace(/\D/g, ''),
      perfil: 'PACIENTE',
      isAtivo: true,
    });
    return data;
  },

  atualizar: async (id: number, payload: Partial<PacienteFormData>): Promise<Paciente> => {
    const { data } = await api.put(`${BASE}/${id}`, {
      ...payload,
      cpf: payload.cpf?.replace(/\D/g, ''),
      telefone: payload.telefone?.replace(/\D/g, ''),
    });
    return data;
  },


  toggleAtivo: async (id: number, isAtivo: boolean): Promise<Paciente> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { isAtivo } });
  return data;
  },


};
