import { create } from 'zustand';
import type { Agendamento, AgendamentoFormData } from './types';

interface AgendamentoDrawerState {
  open: boolean;
  editingId: number | null;
  draft: Partial<AgendamentoFormData>;

  openNew: (dataInicio?: string) => void;
  openEdit: (agendamento: Agendamento) => void;
  clearDraft: () => void;
  updateDraft: (fields: Partial<AgendamentoFormData>) => void;
}

export const useAgendamentoDrawerStore = create<AgendamentoDrawerState>((set) => ({
  open: false,
  editingId: null,
  draft: {},

  openNew: (dataInicio) =>
    set({
      open: true,
      editingId: null,
      draft: dataInicio ? { dataInicio } : {},
    }),

  openEdit: (agendamento) =>
    set({
      open: true,
      editingId: agendamento.id,
      draft: {
        pacienteId: agendamento.pacienteId,
        dentistaId: agendamento.dentistaId,
        dataInicio: agendamento.dataInicio,
        dataFim: agendamento.dataFim,
        observacoes: agendamento.observacoes ?? '',
      },
    }),

  clearDraft: () => set({ open: false, editingId: null, draft: {} }),
  updateDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),
}));
