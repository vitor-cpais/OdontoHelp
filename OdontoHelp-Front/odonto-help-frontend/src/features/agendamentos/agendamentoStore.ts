import { create } from 'zustand';
import type { Agendamento, AgendamentoFormData } from './types';

type DrawerMode = 'view' | 'edit' | 'new';

interface AgendamentoDrawerState {
  open: boolean;
  mode: DrawerMode;
  editingId: number | null;
  draft: Partial<AgendamentoFormData>;
  hasChanges: boolean;

  openNew: (dataInicio?: string, dataFim?: string) => void;
  openView: (agendamento: Agendamento) => void;
  setEditMode: () => void;
  setViewMode: () => void;
  clearDraft: () => void;
  updateDraft: (fields: Partial<AgendamentoFormData>) => void;
  setHasChanges: (v: boolean) => void;
}

export const useAgendamentoDrawerStore = create<AgendamentoDrawerState>((set) => ({
  open: false,
  mode: 'new',
  editingId: null,
  draft: {},
  hasChanges: false,

  openNew: (dataInicio, dataFim) =>
    set({
      open: true,
      mode: 'new',
      editingId: null,
      hasChanges: false,
      draft: {
        dataInicio: dataInicio ? dataInicio.slice(0, 16) : undefined,
        dataFim: dataFim ? dataFim.slice(0, 16) : undefined,
      },
    }),

  openView: (agendamento) =>
    set({
      open: true,
      mode: 'view',
      editingId: agendamento.id,
      hasChanges: false,
      draft: {
        pacienteId: agendamento.pacienteId,
        dentistaId: agendamento.dentistaId,
        dataInicio: agendamento.dataInicio.slice(0, 16),
        dataFim: agendamento.dataFim.slice(0, 16),
        observacoes: agendamento.observacoes ?? '',
        status: agendamento.status,
      },
    }),

  setEditMode: () => set({ mode: 'edit', hasChanges: false }),

  setViewMode: () => set({ mode: 'view', hasChanges: false }),

  clearDraft: () => set({ open: false, mode: 'new', editingId: null, draft: {}, hasChanges: false }),

  updateDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),

  setHasChanges: (v) => set({ hasChanges: v }),
}));
