import api from '../../shared/lib/axios';
import type { ArquivoPaciente, TipoArquivo } from './types';

export interface UploadArquivoPayload {
  file: File;
  tipo: TipoArquivo;
  descricao?: string;
  numeroDente?: number;
  principal?: boolean;
}

export const arquivoService = {
  listar: async (
    pacienteId: number,
    opts?: { tipo?: TipoArquivo; atendimentoId?: number },
  ): Promise<ArquivoPaciente[]> => {
    const params: Record<string, string | number> = {};
    if (opts?.tipo) params.tipo = opts.tipo;
    if (opts?.atendimentoId) params.atendimentoId = opts.atendimentoId;
    const { data } = await api.get<ArquivoPaciente[]>(`/pacientes/${pacienteId}/arquivos`, { params });
    return data;
  },

  fotoPrincipal: async (pacienteId: number): Promise<ArquivoPaciente | null> => {
    const { status, data } = await api.get<ArquivoPaciente>(`/pacientes/${pacienteId}/arquivos/foto-principal`, {
      validateStatus: (s) => s === 200 || s === 204,
    });
    return status === 204 ? null : data;
  },

  upload: async (pacienteId: number, payload: UploadArquivoPayload): Promise<ArquivoPaciente> => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('tipo', payload.tipo);
    if (payload.descricao) form.append('descricao', payload.descricao);
    if (payload.numeroDente != null) form.append('numeroDente', String(payload.numeroDente));
    if (payload.principal) form.append('principal', 'true');
    const { data } = await api.post<ArquivoPaciente>(`/pacientes/${pacienteId}/arquivos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  uploadAtendimento: async (atendimentoId: number, payload: UploadArquivoPayload): Promise<ArquivoPaciente> => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('tipo', payload.tipo);
    if (payload.descricao) form.append('descricao', payload.descricao);
    if (payload.numeroDente != null) form.append('numeroDente', String(payload.numeroDente));
    const { data } = await api.post<ArquivoPaciente>(`/atendimentos/${atendimentoId}/arquivos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  downloadBlob: async (pacienteId: number, arquivoId: number): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/pacientes/${pacienteId}/arquivos/${arquivoId}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  download: async (arquivo: Pick<ArquivoPaciente, 'pacienteId' | 'id' | 'nomeOriginal'>): Promise<void> => {
    const blob = await arquivoService.downloadBlob(arquivo.pacienteId, arquivo.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivo.nomeOriginal;
    link.click();
    URL.revokeObjectURL(url);
  },

  excluir: async (pacienteId: number, arquivoId: number): Promise<void> => {
    await api.delete(`/pacientes/${pacienteId}/arquivos/${arquivoId}`);
  },
};
