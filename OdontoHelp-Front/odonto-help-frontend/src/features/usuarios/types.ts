// src/features/usuarios/typesusuario.ts
import type { SliceResponse } from '../dentistas/types';

export type { SliceResponse };

export type Genero = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
export type PerfilUsuario = 'ADMIN' | 'DENTISTA' | 'RECEPCAO' | 'PACIENTE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  genero: Genero;
  dataNascimento: string;
  perfil: PerfilUsuario;
  isAtivo: boolean;
}

export interface UsuarioFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  genero: Genero;
  dataNascimento: string;
  perfil: PerfilUsuario;
  senha: string;
}

export interface UsuarioPageParams {
  page: number;
  size: number;
  nome?: string;
  perfil?: PerfilUsuario | '';
  isAtivo?: boolean;
}
