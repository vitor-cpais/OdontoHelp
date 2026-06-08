export type StatusFinanceiro = 'ABERTA' | 'PARCIALMENTE_PAGA' | 'PAGA' | 'VENCIDA' | 'CANCELADA';
export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'TRANSFERENCIA' | 'BOLETO' | 'OUTRO';
export type FrequenciaRecorrencia = 'MENSAL';
export type StatusPreNfse = 'PENDENTE' | 'PRONTA_PARA_EMISSAO' | 'EMITIDA_MANUALMENTE' | 'CANCELADA' | 'ERRO_VALIDACAO';
export type StatusNfse = 'PENDENTE' | 'PROCESSANDO' | 'EMITIDA' | 'ERRO' | 'CANCELADA';

export interface ClienteFinanceiro {
  id: number;
  pacienteIdExterno: number;
  nome: string;
  cpf?: string;
}

export type OrigemCobranca = 'MANUAL' | 'ATENDIMENTO' | 'RECORRENCIA';

export interface ParcelaReceber {
  id: number;
  cobrancaId: number;
  numero: number;
  valorTotal: number;
  valorPago: number;
  saldo: number;
  dataVencimento: string;
  status: StatusFinanceiro;
  observacao?: string;
  pacienteNome?: string;
  pacienteIdExterno?: number;
  pacienteEmail?: string;
  pacienteTelefone?: string;
  cobrancaDescricao?: string;
}

export interface RecorrenciaCobranca {
  id: number;
  cobrancaId: number;
  frequencia: FrequenciaRecorrencia;
  diaVencimento: number;
  valorBase: number;
  dataInicio: string;
  dataFim?: string | null;
  proximaGeracao: string;
  ativa: boolean;
  encerrada?: boolean;
  observacao?: string;
}

export interface PreNfse {
  id: number;
  cobrancaId: number;
  pacienteIdExterno?: number;
  pacienteNome?: string;
  descricaoServico: string;
  valorServico: number;
  status: StatusPreNfse;
  numeroNfse?: string | null;
  criadoEm: string;
  emitidaEm?: string | null;
}

export interface NfseFiscal {
  id: string;
  externalChargeId: string;
  externalCustomerId: string;
  pacienteNome?: string | null;
  descricaoServico?: string | null;
  valor?: number | null;
  status: StatusNfse;
  nfseNumero?: string | null;
  mensagem?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NfseConfig {
  habilitado: boolean;
  modoEmissao: 'MANUAL' | 'AUTOMATICO' | string;
  portalOxyUrl?: string | null;
  emissorRazaoSocial?: string | null;
  emissorCnpjMascarado?: string | null;
}

export interface InadimplenteComConsultaHoje extends ParcelaReceber {
  consultaHoje: boolean;
  agendamentoId?: number;
  horaConsulta?: string;
  dentistaNome?: string;
}

export interface Cobranca {
  id: number;
  cliente: ClienteFinanceiro;
  origemTipo?: OrigemCobranca;
  origemIdExterno?: string | null;
  descricao: string;
  valorTotal: number;
  valorPago: number;
  saldoTotal: number;
  quantidadeParcelas: number;
  dataEmissao: string;
  status: StatusFinanceiro;
  observacao?: string;
  parcelas: ParcelaReceber[];
  recorrenciaAtiva?: boolean;
  recorrenciaPausada?: boolean;
  recorrenciaEncerrada?: boolean;
}

export interface DashboardResumo {
  totalAberto: number;
  totalVencido: number;
  recebidoMes: number;
  previsaoRecebimento: number;
  parcelasVencidas: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CriarCobrancaPayload {
  pacienteId: number;
  descricao: string;
  valorBruto: number;
  valorDesconto?: number;
  valorAcrescimo?: number;
  quantidadeParcelas?: number;
  primeiroVencimento?: string;
  observacao?: string;
}

export interface RegistrarPagamentoPayload {
  valor: number;
  dataPagamento: string;
  formaPagamento: FormaPagamento;
  observacao?: string;
}

export interface CriarRecorrenciaPayload {
  diaVencimento: number;
  valorBase: number;
  dataInicio: string;
  dataFim?: string;
  observacao?: string;
}

export interface AtualizarRecorrenciaPayload {
  diaVencimento?: number;
  valorBase?: number;
  dataFim?: string | null;
  proximaGeracao?: string;
  observacao?: string;
}

export interface CriarPreNfsePayload {
  descricaoServico: string;
  valorServico: number;
  codigoServico?: string;
  aliquotaIss?: number;
}

export interface RegistrarNfseNumeroPayload {
  numeroNfse: string;
}

export interface MarcarPreNfseEmitidaPayload {
  numeroNfse: string;
}

export interface EnviarLembreteEmailPayload {
  parcelaId: number;
  pacienteId?: number;
}

export interface PreNfseFiltros {
  status?: StatusPreNfse | '';
}

export interface NfseFiltros {
  status?: StatusNfse | '';
  pacienteId?: number;
  pacienteNome?: string;
  criadoDe?: string;
  criadoAte?: string;
  numeroNfse?: string;
}

export interface AtendimentoPendenteCobranca {
  atendimentoId: number;
  pacienteId: number;
  pacienteNome: string;
  dentistaNome: string;
  horaFim: string | null;
  itensPendentes: {
    itemId: number;
    procedimentoId: number;
    procedimentoNome: string;
    numeroDente: number;
    valorCobradoSnapshot: number;
  }[];
  totalPendente: number;
}

export interface CobrancasFiltros {
  pacienteId?: number;
  pacienteNome?: string;
  status?: StatusFinanceiro | '';
  origemTipo?: OrigemCobranca | '';
  dataEmissaoDe?: string;
  dataEmissaoAte?: string;
}

export interface PendentesCobrancaFiltros {
  nomePaciente?: string;
  dentistaId?: number | '';
  dataFinalizacaoDe?: string;
  dataFinalizacaoAte?: string;
}

export interface InadimplenciaFiltros {
  pacienteId?: number;
  pacienteNome?: string;
  vencimentoDe?: string;
  vencimentoAte?: string;
}

export const COBRANCAS_FILTROS_VAZIOS: CobrancasFiltros = {
  status: '',
  origemTipo: '',
  dataEmissaoDe: '',
  dataEmissaoAte: '',
};

export const PENDENTES_FILTROS_VAZIOS: PendentesCobrancaFiltros = {
  nomePaciente: '',
  dentistaId: '',
  dataFinalizacaoDe: '',
  dataFinalizacaoAte: '',
};

export const FINANCEIRO_DATE_OFFSET_DAYS = 15;

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function financeiroIntervaloDatasPadrao() {
  return {
    de: isoDateOffset(-FINANCEIRO_DATE_OFFSET_DAYS),
    ate: isoDateOffset(FINANCEIRO_DATE_OFFSET_DAYS),
  };
}

export function cobrancasFiltrosPadrao(): CobrancasFiltros {
  const { de, ate } = financeiroIntervaloDatasPadrao();
  return {
    status: '',
    origemTipo: '',
    dataEmissaoDe: de,
    dataEmissaoAte: ate,
  };
}

export function pendentesFiltrosPadrao(): PendentesCobrancaFiltros {
  const { de, ate } = financeiroIntervaloDatasPadrao();
  return {
    nomePaciente: '',
    dentistaId: '',
    dataFinalizacaoDe: de,
    dataFinalizacaoAte: ate,
  };
}

export function inadimplenciaFiltrosPadrao(): InadimplenciaFiltros {
  const { de, ate } = financeiroIntervaloDatasPadrao();
  return {
    vencimentoDe: de,
    vencimentoAte: ate,
  };
}

export const INADIMPLENCIA_FILTROS_VAZIOS: InadimplenciaFiltros = {
  vencimentoDe: '',
  vencimentoAte: '',
};

export function nfseFiltrosPadrao(): NfseFiltros {
  const { de, ate } = financeiroIntervaloDatasPadrao();
  return {
    status: '',
    criadoDe: de,
    criadoAte: ate,
    numeroNfse: '',
  };
}

export const PRE_NFSE_FILTROS_VAZIOS: PreNfseFiltros = {
  status: '',
};

export const NFSE_FILTROS_VAZIOS: NfseFiltros = {
  status: '',
  criadoDe: '',
  criadoAte: '',
  numeroNfse: '',
};
