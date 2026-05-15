// src/features/atendimentos/atendimentoService.ts
import api from '../../shared/lib/axios';
import type { Atendimento, AtendimentoUpdateData } from './types';
import type { SliceResponse } from '../dentistas/types';

const BASE_ATENDIMENTOS  = '/atendimentos';
const BASE_AGENDAMENTOS  = '/agendamentos';

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
    dentistaId: number,
    page = 0,
    size = 10,
  ): Promise<SliceResponse<Atendimento>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(`${BASE_ATENDIMENTOS}/dentista/${dentistaId}?${query}`);
    return data;
  },

  /**
   * Ação explícita: "Iniciar Atendimento".
   * Chama POST /agendamentos/{agendamentoId}/iniciar-atendimento.
   * O backend cria o Atendimento (EM_ANDAMENTO) e muda o Agendamento para ATENDIDO.
   *
   * @param agendamentoId ID do agendamento-pai (não do atendimento)
   * @param observacoesGerais Observações opcionais de abertura
   */
  iniciar: async (agendamentoId: number, observacoesGerais?: string): Promise<Atendimento> => {
    const { data } = await api.post(
      `${BASE_AGENDAMENTOS}/${agendamentoId}/iniciar-atendimento`,
      { observacoesGerais: observacoesGerais ?? null },
    );
    return data;
  },

  /**
   * Edita observações e/ou lista de procedimentos de um atendimento EM_ANDAMENTO.
   * Rejeitado pelo backend se status == FINALIZADO.
   */
  atualizar: async (id: number, payload: AtendimentoUpdateData): Promise<Atendimento> => {
    const { data } = await api.put(`${BASE_ATENDIMENTOS}/${id}`, {
      observacoesGerais: payload.observacoesGerais ?? null,
      itens: payload.itens?.map((item) => ({
        procedimentoId:     item.procedimentoId,
        numeroDente:        item.numeroDente,
        face:               item.face || null,
        situacaoIdentificada: item.situacaoIdentificada,
        observacao:         item.observacao || null,
      })),
    });
    return data;
  },

  /**
   * Finaliza o atendimento: EM_ANDAMENTO → FINALIZADO.
   * O backend registra horaFim e atualiza o odontograma.
   */
  finalizar: async (id: number): Promise<Atendimento> => {
    const { data } = await api.post(`${BASE_ATENDIMENTOS}/${id}/finalizar`);
    return data;
  },
};
