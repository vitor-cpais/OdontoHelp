export type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';

export interface Paciente {
  id: number;
  usuarioId: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  observacoesMedicas?: string | null;
  isAtivo: boolean;
}

export interface PacienteFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  genero: Genero;
  dataNascimento: string;
  senha: string;
  observacoesMedicas: string;
}

export interface PacientePageParams {
  page: number;
  size: number;
  nome?: string;
  isAtivo?: boolean;
}

export interface PacienteObservacao {
  id: number;
  pacienteId: number;
  texto: string;
  autorId: number;
  autorNome: string;
  criadoEm: string;
}
