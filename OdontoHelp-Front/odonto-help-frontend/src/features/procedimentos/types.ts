// src/features/procedimentos/types.ts

export interface Procedimento {
  id: number;
  nome: string;
  descricao: string;
  valorBase: number;
  duracaoMinutos: number;
  corLegenda: string; // #RRGGBB
  isAtivo: boolean;
}

export interface ProcedimentoFormData {
  nome: string;
  descricao: string;
  valorBase: number | '';
  duracaoMinutos: number | '';
  corLegenda: string;
}

export interface ProcedimentoPageParams {
  page: number;
  size: number;
  nome?: string;
  isAtivo?: boolean;
}
