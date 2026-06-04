import api from '../../shared/lib/axios';
import type { Paciente, PacienteFormData, PacienteObservacao, PacientePageParams } from './types';
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
    const body: Record<string, unknown> = {
      ...payload,
      cpf: payload.cpf.replace(/\D/g, ''),
      telefone: payload.telefone.replace(/\D/g, ''),
      perfil: 'PACIENTE',
      isAtivo: true,
    };

    if (!payload.senha) {
      delete body.senha;
    }
    if (!payload.email?.trim()) {
      delete body.email;
    } else {
      body.email = payload.email.trim();
    }

    const { data } = await api.post(BASE, body);
    return data;
  },

  atualizar: async (id: number, payload: Partial<PacienteFormData>): Promise<Paciente> => {
    const body: Record<string, unknown> = {
      ...payload,
      cpf: payload.cpf?.replace(/\D/g, ''),
      telefone: payload.telefone?.replace(/\D/g, ''),
    };

    if (!payload.senha) {
      delete body.senha;
    }
    if (payload.email !== undefined) {
      if (!payload.email?.trim()) {
        delete body.email;
      } else {
        body.email = payload.email.trim();
      }
    }

    const { data } = await api.put(`${BASE}/${id}`, body);
    return data;
  },


  atualizarAnamnese: async (id: number, anamnese: string): Promise<Paciente> => {
    const { data } = await api.patch(`${BASE}/${id}/anamnese`, {
      anamnese: anamnese.trim() || null,
    });
    return data;
  },

  listarObservacoes: async (pacienteId: number, page = 0, size = 5): Promise<SliceResponse<PacienteObservacao>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(`${BASE}/${pacienteId}/observacoes?${query}`);
    return data;
  },

  criarObservacao: async (pacienteId: number, texto: string): Promise<PacienteObservacao> => {
    const { data } = await api.post(`${BASE}/${pacienteId}/observacoes`, { texto: texto.trim() });
    return data;
  },

  toggleAtivo: async (id: number, isAtivo: boolean): Promise<Paciente> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { isAtivo } });
    return data;
  },
};
