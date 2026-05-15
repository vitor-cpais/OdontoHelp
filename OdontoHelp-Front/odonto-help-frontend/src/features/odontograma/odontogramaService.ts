// src/features/odontograma/odontogramaService.ts
import api from '../../shared/lib/axios';
import type { OdontogramaEntry, HistoricoOdontograma } from './types';
import type { SliceResponse } from '../dentistas/types';

export const odontogramaService = {
  buscar: async (pacienteId: number): Promise<OdontogramaEntry[]> => {
    const { data } = await api.get(`/pacientes/${pacienteId}/odontograma`);
    return data;
  },

  historico: async (
    pacienteId: number,
    page = 0,
    size = 20,
  ): Promise<SliceResponse<HistoricoOdontograma>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(`/pacientes/${pacienteId}/odontograma/historico?${query}`);
    return data;
  },

  historicoPorDente: async (
    pacienteId: number,
    numeroDente: number,
    page = 0,
    size = 20,
  ): Promise<SliceResponse<HistoricoOdontograma>> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    const { data } = await api.get(
      `/pacientes/${pacienteId}/odontograma/historico/${numeroDente}?${query}`,
    );
    return data;
  },
};
