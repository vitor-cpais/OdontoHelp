// src/features/procedimentos/procedimentoStore.ts
import { create } from 'zustand';
import type { Procedimento, ProcedimentoFormData } from './types';

interface ProcedimentoDrawerState {
  open: boolean;
  editingId: number | null;
  draft: Partial<ProcedimentoFormData>;
  hasDraft: boolean;

  openNew: () => void;
  openEdit: (procedimento: Procedimento) => void;
  close: () => void;
  updateDraft: (fields: Partial<ProcedimentoFormData>) => void;
  clearDraft: () => void;
}

export const useProcedimentoDrawerStore = create<ProcedimentoDrawerState>((set) => ({
  open: false,
  editingId: null,
  draft: {},
  hasDraft: false,

  openNew: () => set({ open: true, editingId: null }),

  openEdit: (p) =>
    set({
      open: true,
      editingId: p.id,
      draft: {
        nome: p.nome,
        descricao: p.descricao ?? '',
        valorBase: p.valorBase,
        duracaoMinutos: p.duracaoMinutos,
        corLegenda: p.corLegenda ?? '#0F6E56',
      },
      hasDraft: false,
    }),

  close: () => set({ open: false }),

  updateDraft: (fields) =>
    set((state) => ({
      draft: { ...state.draft, ...fields },
      hasDraft: true,
    })),

  clearDraft: () =>
    set({ draft: {}, hasDraft: false, open: false, editingId: null }),
}));
