export type StatusConsulta = 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' | 'FALTA';

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
  page: number;
  size: number;
}

export const STATUS_LABELS: Record<StatusConsulta, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
  FALTA: 'Falta',
};

export const STATUS_COLORS: Record<StatusConsulta, { bg: string; text: string; border: string }> = {
  AGENDADO:  { bg: '#E6F1FB', text: '#185FA5', border: '#B5D4F4' },
  CONFIRMADO:{ bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
  CANCELADO: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
  CONCLUIDO: { bg: '#F1EFE8', text: '#444441', border: '#D3D1C7' },
  FALTA:     { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
};
