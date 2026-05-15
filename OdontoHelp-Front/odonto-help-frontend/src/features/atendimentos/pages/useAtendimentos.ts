// src/features/atendimentos/useAtendimentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AtendimentoUpdateData } from '../types';
import { AGENDAMENTOS_KEY } from '../../agendamentos/useAgendamentos';
import { atendimentoService } from '../atendimentoService';

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

export function useAtendimentosPorDentista(dentistaId: number | null, page = 0) {
  return useQuery({
    queryKey: [ATENDIMENTOS_KEY, 'dentista', dentistaId, page],
    queryFn: () => atendimentoService.listarPorDentista(dentistaId!, page),
    enabled: dentistaId !== null,
    placeholderData: (prev) => prev,
  });
}

/**
 * Inicia o atendimento clínico a partir de um agendamento.
 * Invalida tanto agendamentos quanto atendimentos para manter a UI sincronizada.
 */
export function useIniciarAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agendamentoId, observacoesGerais }: { agendamentoId: number; observacoesGerais?: string }) =>
      atendimentoService.iniciar(agendamentoId, observacoesGerais),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] });
      qc.invalidateQueries({ queryKey: [AGENDAMENTOS_KEY] }); // agendamento mudou para ATENDIDO
    },
  });
}

export function useUpdateAtendimento(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AtendimentoUpdateData) => atendimentoService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] }),
  });
}

/**
 * Finaliza o atendimento: EM_ANDAMENTO → FINALIZADO.
 */
export function useFinalizarAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => atendimentoService.finalizar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ATENDIMENTOS_KEY] }),
  });
}
