// src/features/atendimentos/types.ts

import type { StatusConsulta } from '../agendamentos/types';

export type StatusAtendimento = 'EM_ANDAMENTO' | 'FINALIZADO';

export type SituacaoDente =
  | 'SAUDAVEL' | 'CARIADO' | 'RESTAURADO' | 'EXTRAIDO'
  | 'IMPLANTE' | 'TRATAMENTO_CANAL' | 'COROA' | 'AUSENTE';

export type FaceDente =
  | 'OCLUSAL' | 'MESIAL' | 'DISTAL' | 'VESTIBULAR' | 'LINGUAL' | 'PALATINA';

export const STATUS_ATENDIMENTO_LABELS: Record<StatusAtendimento, string> = {
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADO:   'Finalizado',
};

export const STATUS_ATENDIMENTO_COLORS: Record<StatusAtendimento, { bg: string; text: string; border: string }> = {
  EM_ANDAMENTO: { bg: '#FFF8E1', text: '#B45309', border: '#FCD34D' },
  FINALIZADO:   { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
};

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

export const FACE_DENTE_LABELS: Record<FaceDente, string> = {
  OCLUSAL:    'Oclusal',
  MESIAL:     'Mesial',
  DISTAL:     'Distal',
  VESTIBULAR: 'Vestibular',
  LINGUAL:    'Lingual',
  PALATINA:   'Palatina',
};

export interface ItemAtendimento {
  id: number;
  procedimentoId: number;
  procedimentoNome: string;   // ← sempre presente; nunca usar só o ID
  numeroDente: number;
  face: FaceDente | null;
  situacaoIdentificada: SituacaoDente;
  observacao: string | null;
}

export interface Atendimento {
  id: number;
  agendamentoId: number;
  agendamentoStatus: StatusConsulta;   // ← contexto do agendamento pai
  dentistaId: number;
  dentistaNome: string;
  pacienteId: number;
  pacienteNome: string;
  horaInicio: string;
  horaFim: string | null;
  observacoesGerais: string | null;
  status: StatusAtendimento;
  itens: ItemAtendimento[];
  criadoEm: string;
  atualizadoEm: string;
}

/** Dados para editar um atendimento EM_ANDAMENTO */
export interface AtendimentoUpdateData {
  observacoesGerais?: string;
  itens?: ItemAtendimentoFormData[];
}

export interface ItemAtendimentoFormData {
  procedimentoId: number | '';
  numeroDente: number | '';
  face: FaceDente | '';
  situacaoIdentificada: SituacaoDente | '';
  observacao: string;
}

export interface AtendimentoPageParams {
  pacienteId?: number;
  dentistaId?: number;
  page: number;
  size: number;
}
