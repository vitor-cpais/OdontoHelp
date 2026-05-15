// src/features/planoTratamento/types.ts

export type StatusItemPlano = 'PENDENTE' | 'AGENDADO' | 'REALIZADO' | 'CANCELADO';

export const STATUS_ITEM_PLANO_LABELS: Record<StatusItemPlano, string> = {
  PENDENTE:  'Pendente',
  AGENDADO:  'Agendado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
};

export const STATUS_ITEM_PLANO_COLORS: Record<StatusItemPlano, { bg: string; text: string; border: string }> = {
  PENDENTE:  { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
  AGENDADO:  { bg: '#E6F1FB', text: '#185FA5', border: '#B5D4F4' },
  REALIZADO: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
  CANCELADO: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
};

export interface ItemPlano {
  id: number;
  procedimentoId: number;
  procedimentoNome: string;
  numeroDente: number;
  prioridade: 1 | 2 | 3;
  status: StatusItemPlano;
  observacao: string | null;
  atendimentoRealizacaoId: number | null;
}

export interface PlanoDeTratamento {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  dentistaId: number;
  dentistaNome: string;
  atendimentoId: number | null;
  observacoes: string | null;
  itens: ItemPlano[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface ItemPlanoFormData {
  procedimentoId: number | '';
  numeroDente: number | '';
  prioridade: 1 | 2 | 3 | '';
  observacao: string;
}

export interface PlanoFormData {
  pacienteId: number | '';
  dentistaId: number | '';
  atendimentoId: number | '';
  observacoes: string;
  itens: ItemPlanoFormData[];
}
