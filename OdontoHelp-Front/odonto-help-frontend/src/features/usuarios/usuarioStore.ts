// src/features/usuarios/usuarioStore.ts
import { create } from 'zustand';
import type { UsuarioFormData, Usuario } from './types';
import { maskCpf, maskTelefone } from '../../shared/utils/masks';

interface UsuarioDrawerState {
  open: boolean;
  editingId: number | null;
  draft: Partial<UsuarioFormData>;
  hasDraft: boolean;

  openNew: () => void;
  openEdit: (usuario: Usuario) => void;
  close: () => void;
  updateDraft: (fields: Partial<UsuarioFormData>) => void;
  clearDraft: () => void;
}

export const useUsuarioDrawerStore = create<UsuarioDrawerState>((set) => ({
  open: false,
  editingId: null,
  draft: {},
  hasDraft: false,

  openNew: () => set({ open: true, editingId: null }),

  openEdit: (usuario) =>
    set({
      open: true,
      editingId: usuario.id,
      draft: {
        nome: usuario.nome,
        email: usuario.email,
        cpf: maskCpf(usuario.cpf),
        telefone: maskTelefone(usuario.telefone),
        genero: usuario.genero,
        dataNascimento: usuario.dataNascimento,
        perfil: usuario.perfil,
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
