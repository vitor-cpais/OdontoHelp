// src/features/atendimentos/types.ts

import type { OrigemAgendamento } from '../../domains/agendamentos/agendamentos.types';

export type StatusAtendimento = 'EM_ANDAMENTO' | 'FINALIZADO';

export const STATUS_ATENDIMENTO_LABELS: Record<StatusAtendimento, string> = {
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADO:   'Finalizado',
};

export const STATUS_ATENDIMENTO_COLORS: Record<
  StatusAtendimento,
  { bg: string; text: string; border: string }
> = {
  EM_ANDAMENTO: { bg: '#FFF8E1', text: '#B45309', border: '#FCD34D' },
  FINALIZADO:   { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
};

export type SituacaoDente =
  | 'SAUDAVEL' | 'CARIADO' | 'RESTAURADO' | 'EXTRAIDO'
  | 'IMPLANTE' | 'TRATAMENTO_CANAL' | 'COROA' | 'AUSENTE';

export const SITUACAO_DENTE_LABELS: Record<SituacaoDente, string> = {
  SAUDAVEL:         'Saudável',
  CARIADO:          'Cariado',
  RESTAURADO:       'Restaurado',
  EXTRAIDO:         'Extraído',
  IMPLANTE:         'Implante',
  TRATAMENTO_CANAL: 'Canal',
  COROA:            'Coroa',
  AUSENTE:          'Ausente',
};

export const SITUACAO_DENTE_COLORS: Record<SituacaoDente, string> = {
  SAUDAVEL:         '#0F6E56',
  CARIADO:          '#C0392B',
  RESTAURADO:       '#185FA5',
  EXTRAIDO:         '#888780',
  IMPLANTE:         '#7B3FA0',
  TRATAMENTO_CANAL: '#BA7517',
  COROA:            '#1D7FA0',
  AUSENTE:          '#B4B2A9',
};

export interface ItemAtendimento {
  id: number;
  /** Vincula ao item do plano quando registrado via sugestão (apenas sessão local). */
  itemPlanoOrigemId?: number;
  procedimentoId: number;
  procedimentoNome: string;
  valorCobradoSnapshot?: number;
  statusCobranca?: string;
  financeiroCobrancaId?: string | null;
  numeroDente: number;
  situacaoNova: SituacaoDente;
  observacao: string | null;
}

export interface IniciarAtendimentoAvulsoData {
  pacienteId: number;
  dentistaId?: number;
  observacoesGerais?: string;
  motivo?: string;
}

export interface Atendimento {
  id: number;
  agendamentoId: number;
  agendamentoOrigem?: OrigemAgendamento;
  dentistaId: number;
  dentistaNome: string;
  pacienteId: number;
  pacienteNome: string;
  horaInicio: string;
  horaFim: string | null;
  observacoesGerais: string | null;
  status: StatusAtendimento;
  odontogramaRevisado: boolean;
  itens: ItemAtendimento[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface ItemAtendimentoFormData {
  procedimentoId: number | '';
  numeroDente: number | '';
  situacaoNova: SituacaoDente | '';
  observacao: string;
}

export interface AtendimentoUpdateData {
  observacoesGerais?: string;
  itens?: ItemAtendimentoFormData[];
}

export interface AtendimentoUpdateResult {
  atendimento: Atendimento;
  itensPlanoBaixaManual: import('../planoTratamento/types').ItemPlano[];
}

export interface AtendimentoFiltros {
  nomePaciente?: string;
  status?: StatusAtendimento;
  dataInicio?: string;
  dataFim?: string;
}

export interface AtendimentoPageParams {
  pacienteId?: number;
  dentistaId?: number;
  page: number;
  size: number;
}
