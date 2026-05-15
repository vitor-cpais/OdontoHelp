// src/features/agendamentos/types.ts

export type StatusConsulta =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'ATENDIDO'      // ← Atendimento clínico iniciado (transição automática pelo backend)
  | 'CANCELADO'
  | 'FALTA';

export interface Agendamento {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  dentistaId: number;
  dentistaNome: string;
  status: StatusConsulta;
  dataInicio: string;
  dataFim: string;
  observacoes?: string;
}

export interface AgendamentoFormData {
  pacienteId: number | null;
  dentistaId: number | null;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

export interface AgendamentoPageParams {
  dataInicio?: string;
  dataFim?: string;
  status?: StatusConsulta;
  dentistaId?: number;
  pacienteId?: number;
  nome?: string;
  page: number;
  size: number;
}

export const STATUS_LABELS: Record<StatusConsulta, string> = {
  AGENDADO:   'Agendado',
  CONFIRMADO: 'Confirmado',
  ATENDIDO:   'Em atendimento',
  CANCELADO:  'Cancelado',
  FALTA:      'Falta',
};

export const STATUS_COLORS: Record<StatusConsulta, { bg: string; text: string; border: string }> = {
  AGENDADO:   { bg: '#E6F1FB', text: '#185FA5', border: '#B5D4F4' },
  CONFIRMADO: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
  ATENDIDO:   { bg: '#F3EDF9', text: '#6B21A8', border: '#D8B4FE' },
  CANCELADO:  { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
  FALTA:      { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
};

/** Status que ainda permitem edição do agendamento */
export const STATUS_EDITAVEIS: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO'];

/** Status que permitem iniciar um atendimento clínico */
export const STATUS_PODE_INICIAR_ATENDIMENTO: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO'];

/** Status terminais — agendamento encerrado */
export const STATUS_FINAIS: StatusConsulta[] = ['ATENDIDO', 'CANCELADO', 'FALTA'];
