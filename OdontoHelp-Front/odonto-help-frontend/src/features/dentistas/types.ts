export type Perfil = 'DENTISTA' | 'PACIENTE' | 'ADMIN';
export type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';

export interface Dentista {
  id: number;
  usuarioId: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  cro: string;
  isAtivo: boolean;
}

export interface DentistaFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  senha: string;
  cro: string;
}

export interface DentistaPageParams {
  page: number;
  size: number;
  nome?: string;
  isAtivo?: boolean;
}

export interface SliceResponse<T> {
  content: T[];
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
}

export interface AgendamentoFormData {
  pacienteId: number | null;
  dentistaId: number | null;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}
