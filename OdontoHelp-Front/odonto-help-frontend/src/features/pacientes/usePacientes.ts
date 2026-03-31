import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacienteService } from './pacienteService';
import type { PacienteFormData, PacientePageParams } from './types';

export const PACIENTES_KEY = 'pacientes';

export function usePacientes(params: PacientePageParams, options?: { staleTime?: number }) {
  return useQuery({
    queryKey: [PACIENTES_KEY, params],
    queryFn: () => pacienteService.listar(params),
    placeholderData: (prev) => prev,
    staleTime: options?.staleTime,
  });
}

export function useCreatePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PacienteFormData) => pacienteService.criar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PACIENTES_KEY] }),
  });
}

export function useUpdatePaciente(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PacienteFormData>) => pacienteService.atualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PACIENTES_KEY] }),
  });
}



export function useToggleAtivoPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAtivo }: { id: number; isAtivo: boolean }) =>
      pacienteService.toggleAtivo(id, isAtivo),
    onSuccess: (pacienteAtualizado) => {
      qc.setQueriesData({ queryKey: [PACIENTES_KEY] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((d: any) =>
            d.id === pacienteAtualizado.id ? pacienteAtualizado : d
          ),
        };
      });
    },
  });
}



