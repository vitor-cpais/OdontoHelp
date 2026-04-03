// src/features/usuarios/usuarioService.ts
import api from '../../shared/lib/axios';
import type { Usuario, UsuarioFormData, UsuarioPageParams, SliceResponse } from './types';

const BASE = '/usuarios';

export const usuarioService = {
  listar: async (params: UsuarioPageParams): Promise<SliceResponse<Usuario>> => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('size', String(params.size));
    if (params.nome) query.set('nome', params.nome);
    if (params.perfil) query.set('perfil', params.perfil);
    if (params.isAtivo !== undefined) query.set('isAtivo', String(params.isAtivo));
    const { data } = await api.get(`${BASE}?${query.toString()}`);
    return data;
  },

  buscarPorId: async (id: number): Promise<Usuario> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  criar: async (payload: UsuarioFormData): Promise<Usuario> => {
    const { data } = await api.post(BASE, {
      ...payload,
      cpf: payload.cpf.replace(/\D/g, ''),
      telefone: payload.telefone.replace(/\D/g, ''),
      isAtivo: true,
    });
    return data;
  },

  atualizar: async (id: number, payload: Partial<UsuarioFormData>): Promise<Usuario> => {
    const body: Record<string, unknown> = {
      ...payload,
      cpf: payload.cpf?.replace(/\D/g, ''),
      telefone: payload.telefone?.replace(/\D/g, ''),
    };
    // novaSenha vem em payload.senha — só envia se preenchida
    if (!payload.senha) delete body.senha;
    const { data } = await api.put(`${BASE}/${id}`, body);
    return data;
  },

  toggleAtivo: async (id: number, isAtivo: boolean): Promise<Usuario> => {
    const { data } = await api.patch(`${BASE}/${id}/status`, null, { params: { isAtivo } });
    return data;
  },
};
