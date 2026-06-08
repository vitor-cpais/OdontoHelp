export type TipoArquivo =
  | 'DOCUMENTO_IDENTIDADE'
  | 'FOTO_PACIENTE'
  | 'MODELO_BUCAL'
  | 'RADIOGRAFIA'
  | 'LAUDO'
  | 'RECEITA_ATESTADO'
  | 'OUTRO';

export const TIPO_ARQUIVO_LABELS: Record<TipoArquivo, string> = {
  DOCUMENTO_IDENTIDADE: 'Documento de identidade',
  FOTO_PACIENTE: 'Foto do paciente',
  MODELO_BUCAL: 'Modelo bucal',
  RADIOGRAFIA: 'Radiografia',
  LAUDO: 'Laudo',
  RECEITA_ATESTADO: 'Receita / atestado',
  OUTRO: 'Outro',
};

/** Tipos enviados pelo prontuário do paciente (aba Documentos / Dados). */
export const TIPOS_PACIENTE: TipoArquivo[] = [
  'DOCUMENTO_IDENTIDADE',
  'FOTO_PACIENTE',
  'MODELO_BUCAL',
  'RADIOGRAFIA',
  'LAUDO',
  'OUTRO',
];

/** Tipos enviados durante um atendimento. */
export const TIPOS_ATENDIMENTO: TipoArquivo[] = [
  'RECEITA_ATESTADO',
  'LAUDO',
  'RADIOGRAFIA',
];

export interface ArquivoPaciente {
  id: number;
  pacienteId: number;
  atendimentoId: number | null;
  tipo: TipoArquivo;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  descricao: string | null;
  numeroDente: number | null;
  principal: boolean;
  criadoPorNome: string;
  criadoEm: string;
  urlAcesso: string;
}
