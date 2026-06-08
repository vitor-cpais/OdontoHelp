import type { StatusFinanceiro, StatusPreNfse, StatusNfse } from '../types';

export const STATUS_FINANCEIRO_LABELS: Record<StatusFinanceiro, string> = {
  ABERTA: 'Em aberto',
  PARCIALMENTE_PAGA: 'Parcialmente paga',
  PAGA: 'Paga',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
};

export const STATUS_COBRANCA_ITEM_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado ao financeiro',
  COBRADO: 'Cobrado',
  ERRO: 'Erro',
  NAO_COBRAVEL: 'Não cobrável',
};

export const FORMA_PAGAMENTO_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_DEBITO: 'Cartão débito',
  CARTAO_CREDITO: 'Cartão crédito',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
  OUTRO: 'Outro',
};

export const ORIGEM_COBRANCA_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  ATENDIMENTO: 'Atendimento',
  RECORRENCIA: 'Recorrência',
};

export const STATUS_PRE_NFSE_LABELS: Record<StatusPreNfse, string> = {
  PENDENTE: 'Pendente',
  PRONTA_PARA_EMISSAO: 'Pronta para emissão',
  EMITIDA_MANUALMENTE: 'Emitida',
  CANCELADA: 'Cancelada',
  ERRO_VALIDACAO: 'Erro de validação',
};

export const STATUS_NFSE_LABELS: Record<StatusNfse, string> = {
  PENDENTE: 'Pendente emissão',
  PROCESSANDO: 'Processando',
  EMITIDA: 'Emitida',
  ERRO: 'Erro',
  CANCELADA: 'Cancelada',
};

export function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function fmtData(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

export function parseValorInput(v: string) {
  const s = v.trim();
  if (s.includes(',')) {
    return Number(s.replace(/\./g, '').replace(',', '.'));
  }
  return Number(s);
}
