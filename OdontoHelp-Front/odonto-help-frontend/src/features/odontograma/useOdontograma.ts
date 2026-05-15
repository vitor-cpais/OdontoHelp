// src/features/odontograma/useOdontograma.ts
import { useQuery } from '@tanstack/react-query';
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
    staleTime: 30_000,
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
