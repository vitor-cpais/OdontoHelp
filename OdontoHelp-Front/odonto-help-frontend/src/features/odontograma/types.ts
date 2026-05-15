// src/features/odontograma/types.ts
import type { SituacaoDente } from '../atendimentos/types';

export interface OdontogramaEntry {
  id: number;
  numeroDente: number;
  situacaoAtual: SituacaoDente;
  observacao: string | null;
  atualizadoEm: string;
}

export interface HistoricoOdontograma {
  id: number;
  numeroDente: number;
  situacaoAnterior: SituacaoDente | null;
  situacaoNova: SituacaoDente;
  dentistaId: number;
  dentistaNome: string;
  atendimentoId: number;
  observacao: string | null;
  registradoEm: string;
}

/** Mapa completo: numeroDente → entry (só dentes com registro) */
export type OdontogramaMap = Record<number, OdontogramaEntry>;
