import { create } from 'zustand';
import type { PacienteFormData, Paciente } from './types';
import { maskCpf, maskTelefone } from '../../shared/utils/masks';

interface PacienteDrawerState {
  open: boolean;
  editingId: number | null;
  draft: Partial<PacienteFormData>;
  hasDraft: boolean;

  openNew: () => void;
  openEdit: (paciente: Paciente) => void;
  close: () => void;
  updateDraft: (fields: Partial<PacienteFormData>) => void;
  clearDraft: () => void;
}

export const usePacienteDrawerStore = create<PacienteDrawerState>((set) => ({
  open: false,
  editingId: null,
  draft: {},
  hasDraft: false,

  openNew: () => set({ open: true, editingId: null }),

  openEdit: (paciente) =>
    set({
      open: true,
      editingId: paciente.id,
      draft: {
        nome: paciente.nome,
        email: paciente.email,
        cpf: maskCpf(paciente.cpf),
        telefone: maskTelefone(paciente.telefone),
        genero: paciente.genero,
        dataNascimento: paciente.dataNascimento,
        observacoesMedicas: paciente.observacoesMedicas,
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
    set({ draft: {}, hasDraft: false, open: false, editingId: null }),
}));
