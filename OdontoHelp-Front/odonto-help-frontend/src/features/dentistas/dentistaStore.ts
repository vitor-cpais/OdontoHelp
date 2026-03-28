import { create } from 'zustand';
import type { DentistaFormData, Dentista } from './types';
import { maskCpf, maskTelefone } from '../../shared/utils/masks';

interface DentistaDrawerState {
  open: boolean;
  editingId: number | null;
  draft: Partial<DentistaFormData>;
  hasDraft: boolean;

  openNew: () => void;
  openEdit: (dentista: Dentista) => void;
  close: () => void;
  updateDraft: (fields: Partial<DentistaFormData>) => void;
  clearDraft: () => void;
}

export const useDentistaDrawerStore = create<DentistaDrawerState>((set, get) => ({
  open: false,
  editingId: null,
  draft: {},
  hasDraft: false,

  openNew: () => set({ open: true, editingId: null }),

  openEdit: (dentista) =>
    set({
      open: true,
      editingId: dentista.id,
      draft: {
        nome: dentista.nome,
        email: dentista.email,
        cpf: maskCpf(dentista.cpf),
         telefone: maskTelefone(dentista.telefone),
        genero: dentista.genero,
        dataNascimento: dentista.dataNascimento,
        cro: dentista.cro,
        senha: '',
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
    set({
      draft: {},
      hasDraft: false,
      open: false,
      editingId: null,
    }),
}));
