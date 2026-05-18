// src/features/atendimentos/atendimentoService.ts
import api from '../../shared/lib/axios';
import type { Atendimento, AtendimentoUpdateData, AtendimentoFiltros } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE_ATENDIMENTOS = '/atendimentos';
const BASE_AGENDAMENTOS = '/agendamentos';

export const atendimentoService = {
  buscarPorId: async (id: number): Promise<Atendimento> => {
    const { data } = await api.get(`${BASE_ATENDIMENTOS}/${id}`);
    return data;
  },

  listarPorPaciente: async (
    pacienteId: number,
    page = 0,
    size = 10,
  ): Promise<SliceResponse<Atendimento>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(`${BASE_ATENDIMENTOS}/paciente/${pacienteId}?${query}`);
    return data;
  },

  // CORREÇÃO: aceita filtros opcionais de nomePaciente, status, dataInicio, dataFim.
  // Quando dentistaId é null (ADMIN), usa GET /atendimentos sem filtro de dentista.
  // O backend precisa ter esses params — ver AtendimentoController e AtendimentoRepository.
  listarPorDentista: async (
    dentistaId: number | null,
    page = 0,
    size = 10,
    filtros: AtendimentoFiltros = {},
  ): Promise<SliceResponse<Atendimento>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (filtros.nomePaciente) query.set('nomePaciente', filtros.nomePaciente);
    if (filtros.status)       query.set('status', filtros.status);
    if (filtros.dataInicio)   query.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim)      query.set('dataFim', filtros.dataFim);

    const url = dentistaId !== null
      ? `${BASE_ATENDIMENTOS}/dentista/${dentistaId}?${query}`
      : `${BASE_ATENDIMENTOS}?${query}`;

    const { data } = await api.get(url);
    return data;
  },

  iniciar: async (agendamentoId: number, observacoesGerais?: string): Promise<Atendimento> => {
    const { data } = await api.post(
      `${BASE_AGENDAMENTOS}/${agendamentoId}/iniciar-atendimento`,
      { observacoesGerais: observacoesGerais ?? null },
    );
    return data;
  },

  atualizar: async (id: number, payload: AtendimentoUpdateData): Promise<Atendimento> => {
    const { data } = await api.put(`${BASE_ATENDIMENTOS}/${id}`, {
      observacoesGerais: payload.observacoesGerais ?? null,
      itens: payload.itens?.map((item) => ({
        procedimentoId:       item.procedimentoId,
        numeroDente:          item.numeroDente,
        face:                 item.face || null,
        situacaoIdentificada: item.situacaoIdentificada,
        observacao:           item.observacao || null,
      })),
    });
    return data;
  },

  finalizar: async (id: number): Promise<Atendimento> => {
    const { data } = await api.post(`${BASE_ATENDIMENTOS}/${id}/finalizar`);
    return data;
  },
};
