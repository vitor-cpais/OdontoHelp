import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agendamentosClient } from '../../domains/agendamentos';
import { financeiroService } from './financeiroService';
import type {
  CobrancasFiltros,
  CriarCobrancaPayload,
  CriarPreNfsePayload,
  CriarRecorrenciaPayload,
  AtualizarRecorrenciaPayload,
  EnviarLembreteEmailPayload,
  InadimplenciaFiltros,
  InadimplenteComConsultaHoje,
  MarcarPreNfseEmitidaPayload,
  PreNfseFiltros,
  NfseFiltros,
  RegistrarNfseNumeroPayload,
  RegistrarPagamentoPayload,
} from './types';

const PAGE_SIZE = 10;
const INADIMPLENCIA_MERGE_SIZE = 100;

const hojeIso = () => new Date().toISOString().slice(0, 10);

async function fetchAgendamentosHoje() {
  const hoje = hojeIso();
  const data = await agendamentosClient.listar({
    page: 0,
    size: 200,
    dataInicio: hoje,
    dataFim: hoje,
  });
  return data.content.filter(
    (a) => a.status === 'AGENDADO' || a.status === 'CONFIRMADO',
  );
}

export function useDashboardFinanceiro() {
  return useQuery({ queryKey: ['financeiro', 'dashboard'], queryFn: financeiroService.dashboard });
}

export function useCobrancas(page = 0, filtros: CobrancasFiltros = {}) {
  return useQuery({
    queryKey: ['financeiro', 'cobrancas', page, filtros],
    queryFn: () => financeiroService.listarCobrancas({ ...filtros, page, size: PAGE_SIZE }),
  });
}

export function useInadimplencia(page = 0, filtros: InadimplenciaFiltros = {}) {
  return useQuery({
    queryKey: ['financeiro', 'inadimplencia', page, filtros],
    queryFn: () => financeiroService.listarInadimplencia({ ...filtros, page, size: PAGE_SIZE }),
  });
}

export function useAgendamentosHojePacienteIds() {
  return useQuery({
    queryKey: ['agendamentos', 'hoje', 'pacienteIds'],
    queryFn: async () => {
      const agendamentos = await fetchAgendamentosHoje();
      return new Set(agendamentos.map((a) => a.pacienteId));
    },
    staleTime: 60_000,
  });
}

export function useInadimplentesComConsultaHoje() {
  return useQuery({
    queryKey: ['financeiro', 'inadimplentes-consulta-hoje'],
    queryFn: async (): Promise<InadimplenteComConsultaHoje[]> => {
      const [inadimplencia, agendamentos] = await Promise.all([
        financeiroService.listarInadimplencia({ page: 0, size: INADIMPLENCIA_MERGE_SIZE }),
        fetchAgendamentosHoje(),
      ]);

      const agendamentoPorPaciente = new Map(
        agendamentos.map((a) => [a.pacienteId, a]),
      );

      return inadimplencia.content.map((parcela) => {
        const pacienteId = parcela.pacienteIdExterno;
        const agendamento = pacienteId != null ? agendamentoPorPaciente.get(pacienteId) : undefined;
        return {
          ...parcela,
          consultaHoje: !!agendamento,
          agendamentoId: agendamento?.id,
          horaConsulta: agendamento
            ? new Date(agendamento.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : undefined,
          dentistaNome: agendamento?.dentistaNome,
        };
      }).filter((p) => p.consultaHoje);
    },
    staleTime: 60_000,
  });
}

export function usePreNfse(page = 0, filtros: PreNfseFiltros = {}) {
  return useQuery({
    queryKey: ['financeiro', 'pre-nfse', page, filtros],
    queryFn: () => financeiroService.listarPreNfse({ ...filtros, page, size: PAGE_SIZE }),
  });
}

export function useNfseConfig() {
  return useQuery({
    queryKey: ['financeiro', 'nfse', 'config'],
    queryFn: () => financeiroService.nfseConfig(),
    staleTime: 60_000,
  });
}

export function useNfse(page = 0, filtros: NfseFiltros = {}) {
  return useQuery({
    queryKey: ['financeiro', 'nfse', page, filtros],
    queryFn: () => financeiroService.listarNfse({ ...filtros, page, size: PAGE_SIZE }),
  });
}

export function useRegistrarNfseNumero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RegistrarNfseNumeroPayload }) =>
      financeiroService.registrarNfseNumero(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro', 'nfse'] });
    },
  });
}

export function useRecorrencia(cobrancaId: number | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['financeiro', 'recorrencia', cobrancaId],
    queryFn: () => financeiroService.buscarRecorrencia(cobrancaId!),
    enabled: enabled && cobrancaId != null,
    retry: false,
  });
}

export function useCriarCobranca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarCobrancaPayload) => financeiroService.criarCobranca(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useRegistrarPagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parcelaId, payload }: { parcelaId: number; payload: RegistrarPagamentoPayload }) =>
      financeiroService.registrarPagamento(parcelaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function usePerdoarParcela() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parcelaId, observacao }: { parcelaId: number; observacao?: string }) =>
      financeiroService.perdoarParcela(parcelaId, observacao),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useGerarCobrancaAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeiroService.gerarAtendimento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
      qc.invalidateQueries({ queryKey: ['atendimentos'] });
    },
  });
}

export function useCriarRecorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cobrancaId, payload }: { cobrancaId: number; payload: CriarRecorrenciaPayload }) =>
      financeiroService.criarRecorrencia(cobrancaId, payload),
    onSuccess: (rec) => {
      qc.setQueryData(['financeiro', 'recorrencia', rec.cobrancaId], rec);
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function usePausarRecorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeiroService.pausarRecorrencia(id),
    onSuccess: (rec) => {
      qc.setQueryData(['financeiro', 'recorrencia', rec.cobrancaId], rec);
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useReativarRecorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeiroService.reativarRecorrencia(id),
    onSuccess: (rec) => {
      qc.setQueryData(['financeiro', 'recorrencia', rec.cobrancaId], rec);
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useAtualizarRecorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AtualizarRecorrenciaPayload }) =>
      financeiroService.atualizarRecorrencia(id, payload),
    onSuccess: (rec) => {
      qc.setQueryData(['financeiro', 'recorrencia', rec.cobrancaId], rec);
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useEncerrarRecorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeiroService.encerrarRecorrencia(id),
    onSuccess: (rec) => {
      qc.setQueryData(['financeiro', 'recorrencia', rec.cobrancaId], rec);
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useCriarPreNfse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cobrancaId, payload }: { cobrancaId: number; payload: CriarPreNfsePayload }) =>
      financeiroService.criarPreNfse(cobrancaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro'] });
    },
  });
}

export function useValidarPreNfse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => financeiroService.validarPreNfse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro', 'pre-nfse'] });
    },
  });
}

export function useMarcarPreNfseEmitida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MarcarPreNfseEmitidaPayload }) =>
      financeiroService.marcarPreNfseEmitida(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financeiro', 'pre-nfse'] });
    },
  });
}

export function useEnviarLembreteEmail() {
  return useMutation({
    mutationFn: (payload: EnviarLembreteEmailPayload) => financeiroService.enviarLembreteEmail(payload.parcelaId),
  });
}

export { PAGE_SIZE as FINANCEIRO_PAGE_SIZE };
