// src/features/atendimentos/useAtendimentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { atendimentoService } from './atendimentoService';
import { AGENDAMENTOS_KEY } from '../../domains/agendamentos';
import { ODONTOGRAMA_KEY } from '../odontograma/useOdontograma';
import { PLANO_KEY } from '../planoTratamento/usePlanoTratamento';
import type { AtendimentoUpdateData, AtendimentoFiltros, IniciarAtendimentoAvulsoData } from './types';
import type { PendentesCobrancaFiltros } from '../financeiro/types';

export const ATENDIMENTOS_KEY = 'atendimentos';

export function useAtendimento(id: number | null) {
  return useQuery({
    queryKey: [ATENDIMENTOS_KEY, id],
    queryFn: () => atendimentoService.buscarPorId(id!),
    enabled: id !== null,
  });
}

export function useAtendimentosPorPaciente(pacienteId: number | null, page = 0) {
  return useQuery({
    queryKey: [ATENDIMENTOS_KEY, 'paciente', pacienteId, page],
    queryFn: () => atendimentoService.listarPorPaciente(pacienteId!, page),
    enabled: pacienteId !== null,
    placeholderData: (prev) => prev,
  });
}

// CORREÇÃO: filtros incluídos na queryKey para revalidar ao mudar qualquer filtro.
// dentistaId null = ADMIN, usa endpoint sem filtro de dentista.
export function useAtendimentosPorDentista(
  dentistaId: number | null,
  page = 0,
  filtros: AtendimentoFiltros = {},
) {
  return useQuery({
    queryKey: [ATENDIMENTOS_KEY, 'dentista', dentistaId, page, filtros],
    queryFn: () => atendimentoService.listarPorDentista(dentistaId, page, 10, filtros),
    enabled: true, // ADMIN (dentistaId null) também carrega
    placeholderData: (prev) => prev,
  });
}

export function useIniciarAtendimentoAvulso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IniciarAtendimentoAvulsoData) => atendimentoService.iniciarAvulso(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY] });
    },
  });
}

export function useIniciarAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agendamentoId, observacoesGerais }: { agendamentoId: number; observacoesGerais?: string }) =>
      atendimentoService.iniciar(agendamentoId, observacoesGerais),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY] });
    },
  });
}

export function useUpdateAtendimento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AtendimentoUpdateData) => atendimentoService.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY, id] });
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY] });
      qc.invalidateQueries({ queryKey: [PLANO_KEY] });
    },
  });
}

export function useMarcarOdontogramaRevisado(atendimentoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (revisado: boolean) => atendimentoService.marcarOdontogramaRevisado(atendimentoId, revisado),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY, atendimentoId] }),
  });
}

export function useBaixaPlanoManual(atendimentoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => atendimentoService.baixaPlanoManual(atendimentoId, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY, atendimentoId] });
      qc.invalidateQueries({ queryKey: [PLANO_KEY] });
    },
  });
}

export function useRemoverItemAtendimento(atendimentoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => atendimentoService.removerItem(atendimentoId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY, atendimentoId] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY] });
    },
  });
}

export function useFinalizarAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => atendimentoService.finalizar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY] });
      qc.invalidateQueries({ queryKey: [PLANO_KEY] });
      qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] });
    },
  });
}

export function useAtendimentosPendentesCobranca(page = 0, filtros: PendentesCobrancaFiltros = {}) {
  return useQuery({
    queryKey: [ATENDIMENTOS_KEY, 'pendentes-cobranca', page, filtros],
    queryFn: () => atendimentoService.listarPendentesCobranca(page, 10, filtros),
  });
}
