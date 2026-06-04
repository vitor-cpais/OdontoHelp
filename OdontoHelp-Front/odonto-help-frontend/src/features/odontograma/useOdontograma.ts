// src/features/odontograma/useOdontograma.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService } from './odontogramaService';
import type { OdontogramaMap } from './types';

export const ODONTOGRAMA_KEY = 'odontograma';

export function useOdontograma(pacienteId: number | null) {
  return useQuery({
    queryKey: [ODONTOGRAMA_KEY, pacienteId],
    queryFn: async () => {
      const lista = await odontogramaService.buscar(pacienteId!);
      // converte lista → mapa por numeroDente para O(1) lookup no visual
      const mapa: OdontogramaMap = {};
      lista.forEach((e) => { mapa[e.numeroDente] = e; });
      return mapa;
    },
    enabled: pacienteId !== null,
    staleTime: 0, // Sempre fresco para exibir atualizações em tempo real
  });
}

export function useOdontogramaVersoes(pacienteId: number | null, page = 0, size = 50) {
  return useQuery({
    queryKey: [ODONTOGRAMA_KEY, 'versoes', pacienteId, page, size],
    queryFn: () => odontogramaService.versoes(pacienteId!, page, size),
    enabled: pacienteId !== null,
    placeholderData: (prev) => prev,
  });
}

export function useOdontogramaVersao(pacienteId: number | null, snapshotId: number | null) {
  return useQuery({
    queryKey: [ODONTOGRAMA_KEY, 'versao', pacienteId, snapshotId],
    queryFn: async () => {
      const lista = await odontogramaService.buscarVersao(pacienteId!, snapshotId!);
      const mapa: OdontogramaMap = {};
      lista.forEach((e) => { mapa[e.numeroDente] = e; });
      return mapa;
    },
    enabled: pacienteId !== null && snapshotId !== null,
  });
}

export function useHistoricoOdontograma(pacienteId: number | null, page = 0) {
  return useQuery({
    queryKey: [ODONTOGRAMA_KEY, 'historico', pacienteId, page],
    queryFn: () => odontogramaService.historico(pacienteId!, page),
    enabled: pacienteId !== null,
    placeholderData: (prev) => prev,
  });
}

export function useHistoricoPorDente(
  pacienteId: number | null,
  numeroDente: number | null,
  page = 0,
) {
  return useQuery({
    queryKey: [ODONTOGRAMA_KEY, 'historico', pacienteId, numeroDente, page],
    queryFn: () => odontogramaService.historicoPorDente(pacienteId!, numeroDente!, page),
    enabled: pacienteId !== null && numeroDente !== null,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateOdontograma(pacienteId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { numeroDente: number; situacaoAtual: string; observacao?: string | null }) =>
      odontogramaService.atualizar(pacienteId!, data.numeroDente, {
        situacaoAtual: data.situacaoAtual,
        observacao: data.observacao,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY, pacienteId] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY, 'historico', pacienteId] });
      qc.invalidateQueries({ queryKey: [ODONTOGRAMA_KEY, 'versoes', pacienteId] });
    },
  });
}
