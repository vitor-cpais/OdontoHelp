import api from '../../shared/lib/axios';
import type {
  Atendimento,
  AtendimentoUpdateData,
  AtendimentoUpdateResult,
  AtendimentoFiltros,
  IniciarAtendimentoAvulsoData,
} from './types';
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

  iniciarAvulso: async (payload: IniciarAtendimentoAvulsoData): Promise<Atendimento> => {
    const { data } = await api.post(`${BASE_ATENDIMENTOS}/iniciar-avulso`, {
      pacienteId: payload.pacienteId,
      dentistaId: payload.dentistaId ?? null,
      observacoesGerais: payload.observacoesGerais ?? null,
      motivo: payload.motivo ?? null,
    });
    return data;
  },

  iniciar: async (agendamentoId: number, observacoesGerais?: string): Promise<Atendimento> => {
    const { data } = await api.post(
      `${BASE_AGENDAMENTOS}/${agendamentoId}/iniciar-atendimento`,
      { observacoesGerais: observacoesGerais ?? null },
    );
    return data;
  },

  atualizar: async (id: number, payload: AtendimentoUpdateData): Promise<AtendimentoUpdateResult> => {
    const { data } = await api.put(`${BASE_ATENDIMENTOS}/${id}`, {
      observacoesGerais: payload.observacoesGerais ?? null,
      itens: payload.itens?.map((item) => ({
        procedimentoId: item.procedimentoId,
        numeroDente:    item.numeroDente,
        situacaoNova:   item.situacaoNova,
        observacao:     item.observacao || null,
      })),
    });
    return data;
  },

  removerItem: async (atendimentoId: number, itemId: number): Promise<void> => {
    await api.delete(`${BASE_ATENDIMENTOS}/${atendimentoId}/itens/${itemId}`);
  },

  finalizar: async (id: number): Promise<Atendimento> => {
    const { data } = await api.post(`${BASE_ATENDIMENTOS}/${id}/finalizar`);
    return data;
  },

  marcarOdontogramaRevisado: async (id: number, revisado: boolean): Promise<Atendimento> => {
    const { data } = await api.patch(
      `${BASE_ATENDIMENTOS}/${id}/odontograma-revisado?revisado=${revisado}`,
    );
    return data;
  },

  baixaPlanoManual: async (id: number, itensPlanoIds: number[]): Promise<Atendimento> => {
    const { data } = await api.post(`${BASE_ATENDIMENTOS}/${id}/baixa-plano-manual`, {
      itemPlanoIds: itensPlanoIds,
    });
    return data;
  },

  listarPendentesCobranca: async (
    page = 0,
    size = 10,
    filtros: {
      nomePaciente?: string;
      dentistaId?: number | '';
      dataFinalizacaoDe?: string;
      dataFinalizacaoAte?: string;
    } = {},
  ) => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (filtros.nomePaciente) query.set('nomePaciente', filtros.nomePaciente);
    if (filtros.dentistaId) query.set('dentistaId', String(filtros.dentistaId));
    if (filtros.dataFinalizacaoDe) query.set('dataFinalizacaoDe', filtros.dataFinalizacaoDe);
    if (filtros.dataFinalizacaoAte) query.set('dataFinalizacaoAte', filtros.dataFinalizacaoAte);
    const { data } = await api.get(`${BASE_ATENDIMENTOS}/pendentes-cobranca?${query}`);
    return data;
  },
};
