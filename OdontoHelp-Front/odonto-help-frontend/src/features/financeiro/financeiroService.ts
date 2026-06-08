import financeiroApi from '../../shared/lib/financeiroAxios';
import type {
  AtualizarRecorrenciaPayload,
  Cobranca,
  CobrancasFiltros,
  CriarCobrancaPayload,
  CriarPreNfsePayload,
  CriarRecorrenciaPayload,
  DashboardResumo,
  EnviarLembreteEmailPayload,
  InadimplenciaFiltros,
  MarcarPreNfseEmitidaPayload,
  NfseConfig,
  NfseFiltros,
  NfseFiscal,
  PageResponse,
  ParcelaReceber,
  PreNfse,
  PreNfseFiltros,
  RecorrenciaCobranca,
  RegistrarNfseNumeroPayload,
  RegistrarPagamentoPayload,
} from './types';

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

export const financeiroService = {
  dashboard: () => financeiroApi.get<DashboardResumo>('/financeiro/dashboard/resumo').then((r) => r.data),

  listarCobrancas: (params?: CobrancasFiltros & { page?: number; size?: number }) =>
    financeiroApi.get<PageResponse<Cobranca>>('/financeiro/cobrancas', {
      params: cleanParams({
        page: params?.page,
        size: params?.size,
        pacienteId: params?.pacienteId,
        status: params?.status || undefined,
        origemTipo: params?.origemTipo || undefined,
        dataEmissaoDe: params?.dataEmissaoDe,
        dataEmissaoAte: params?.dataEmissaoAte,
      }),
    }).then((r) => r.data),

  buscarCobranca: (id: number) =>
    financeiroApi.get<Cobranca>(`/financeiro/cobrancas/${id}`).then((r) => r.data),

  criarCobranca: (payload: CriarCobrancaPayload) =>
    financeiroApi.post<Cobranca>('/financeiro/cobrancas', payload).then((r) => r.data),

  cancelarCobranca: (id: number) =>
    financeiroApi.patch<Cobranca>(`/financeiro/cobrancas/${id}/cancelar`).then((r) => r.data),

  listarInadimplencia: (params?: InadimplenciaFiltros & { page?: number; size?: number }) =>
    financeiroApi.get<PageResponse<ParcelaReceber>>('/financeiro/inadimplencia', {
      params: cleanParams({
        page: params?.page,
        size: params?.size,
        pacienteId: params?.pacienteId,
        vencimentoDe: params?.vencimentoDe,
        vencimentoAte: params?.vencimentoAte,
      }),
    }).then((r) => r.data),

  registrarPagamento: (parcelaId: number, payload: RegistrarPagamentoPayload) =>
    financeiroApi.post(`/financeiro/parcelas-receber/${parcelaId}/pagamentos`, payload).then((r) => r.data),

  perdoarParcela: (parcelaId: number, observacao?: string) =>
    financeiroApi.patch<ParcelaReceber>(`/financeiro/parcelas-receber/${parcelaId}/perdoar`, { observacao }).then((r) => r.data),

  gerarAtendimento: (payload: {
    pacienteId: number;
    atendimentoId: number;
    descricao: string;
    itens: { itemAtendimentoId: number; procedimentoId: number; procedimentoNome: string; valorCobradoSnapshot: number }[];
    quantidadeParcelas?: number;
    primeiroVencimento?: string;
    valorDesconto?: number;
    valorAcrescimo?: number;
    idempotencyKey?: string;
  }) => financeiroApi.post<Cobranca>('/financeiro/cobrancas/atendimento', payload).then((r) => r.data),

  criarRecorrencia: (cobrancaId: number, payload: CriarRecorrenciaPayload) =>
    financeiroApi.post<RecorrenciaCobranca>(`/financeiro/cobrancas/${cobrancaId}/recorrencia`, payload).then((r) => r.data),

  buscarRecorrencia: async (cobrancaId: number): Promise<RecorrenciaCobranca | null> => {
    try {
      const { data } = await financeiroApi.get<RecorrenciaCobranca>(`/financeiro/cobrancas/${cobrancaId}/recorrencia`);
      return data;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 404) return null;
      }
      throw err;
    }
  },

  pausarRecorrencia: (id: number) =>
    financeiroApi.patch<RecorrenciaCobranca>(`/financeiro/recorrencias/${id}/pausar`).then((r) => r.data),

  reativarRecorrencia: (id: number) =>
    financeiroApi.patch<RecorrenciaCobranca>(`/financeiro/recorrencias/${id}/reativar`).then((r) => r.data),

  atualizarRecorrencia: (id: number, payload: AtualizarRecorrenciaPayload) =>
    financeiroApi.patch<RecorrenciaCobranca>(`/financeiro/recorrencias/${id}`, payload).then((r) => r.data),

  encerrarRecorrencia: (id: number) =>
    financeiroApi.patch<RecorrenciaCobranca>(`/financeiro/recorrencias/${id}/encerrar`).then((r) => r.data),

  listarPreNfse: (params?: PreNfseFiltros & { page?: number; size?: number }) =>
    financeiroApi.get<PageResponse<PreNfse>>('/financeiro/pre-nfse', {
      params: cleanParams({
        page: params?.page,
        size: params?.size,
        status: params?.status || undefined,
      }),
    }).then((r) => r.data),

  criarPreNfse: (cobrancaId: number, payload: CriarPreNfsePayload) =>
    financeiroApi.post<PreNfse>(`/financeiro/cobrancas/${cobrancaId}/pre-nfse`, payload).then((r) => r.data),

  validarPreNfse: (id: number) =>
    financeiroApi.patch<PreNfse>(`/financeiro/pre-nfse/${id}/validar`).then((r) => r.data),

  marcarPreNfseEmitida: (id: number, payload: MarcarPreNfseEmitidaPayload) =>
    financeiroApi.patch<PreNfse>(`/financeiro/pre-nfse/${id}/marcar-emitida-manualmente`, payload).then((r) => r.data),

  enviarLembreteEmail: (parcelaId: number) =>
    financeiroApi.post(`/financeiro/parcelas-receber/${parcelaId}/lembrete-email`).then((r) => r.data),

  listarPreNfseTodas: async (filtros?: PreNfseFiltros): Promise<PreNfse[]> => {
    const size = 100;
    let page = 0;
    let totalPages = 1;
    const todas: PreNfse[] = [];
    while (page < totalPages) {
      const data = await financeiroApi.get<PageResponse<PreNfse>>('/financeiro/pre-nfse', {
        params: cleanParams({
          page,
          size,
          status: filtros?.status || undefined,
        }),
      }).then((r) => r.data);
      todas.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    }
    return todas;
  },

  nfseConfig: () =>
    financeiroApi.get<NfseConfig>('/financeiro/nfse/config').then((r) => r.data),

  listarNfse: (params?: NfseFiltros & { page?: number; size?: number }) =>
    financeiroApi.get<PageResponse<NfseFiscal>>('/financeiro/nfse', {
      params: cleanParams({
        page: params?.page,
        size: params?.size,
        status: params?.status || undefined,
        pacienteId: params?.pacienteId,
        criadoDe: params?.criadoDe,
        criadoAte: params?.criadoAte,
        numeroNfse: params?.numeroNfse,
      }),
    }).then((r) => r.data),

  registrarNfseNumero: (id: string, payload: RegistrarNfseNumeroPayload) =>
    financeiroApi.put<NfseFiscal>(`/financeiro/nfse/${id}/numero`, payload).then((r) => r.data),

  listarNfseTodas: async (filtros?: NfseFiltros): Promise<NfseFiscal[]> => {
    const size = 100;
    let page = 0;
    let totalPages = 1;
    const todas: NfseFiscal[] = [];
    while (page < totalPages) {
      const data = await financeiroService.listarNfse({ ...filtros, page, size });
      todas.push(...data.content);
      totalPages = data.totalPages;
      page += 1;
    }
    return todas;
  },
};
