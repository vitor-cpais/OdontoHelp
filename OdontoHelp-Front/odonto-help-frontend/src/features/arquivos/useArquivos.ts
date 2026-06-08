import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { arquivoService, type UploadArquivoPayload } from './arquivoService';
import type { TipoArquivo } from './types';

export const ARQUIVOS_KEY = 'arquivos';
export const FOTO_PRINCIPAL_KEY = 'foto-principal';
export const ARQUIVO_BLOB_KEY = 'arquivo-blob';

export function useArquivos(
  pacienteId: number | null,
  opts?: { tipo?: TipoArquivo; atendimentoId?: number },
) {
  return useQuery({
    queryKey: [ARQUIVOS_KEY, pacienteId, opts?.tipo, opts?.atendimentoId],
    queryFn: () => arquivoService.listar(pacienteId!, opts),
    enabled: pacienteId !== null,
  });
}

export function useFotoPrincipal(pacienteId: number | null) {
  return useQuery({
    queryKey: [FOTO_PRINCIPAL_KEY, pacienteId],
    queryFn: () => arquivoService.fotoPrincipal(pacienteId!),
    enabled: pacienteId !== null,
  });
}

export function useArquivoBlobUrl(pacienteId: number | null, arquivoId: number | null) {
  const query = useQuery({
    queryKey: [ARQUIVO_BLOB_KEY, pacienteId, arquivoId],
    queryFn: async () => {
      const blob = await arquivoService.downloadBlob(pacienteId!, arquivoId!);
      return URL.createObjectURL(blob);
    },
    enabled: pacienteId !== null && arquivoId !== null,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const url = query.data;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [query.data]);

  return query;
}

function invalidateArquivos(qc: ReturnType<typeof useQueryClient>, pacienteId: number) {
  qc.invalidateQueries({ queryKey: [ARQUIVOS_KEY, pacienteId] });
  qc.invalidateQueries({ queryKey: [FOTO_PRINCIPAL_KEY, pacienteId] });
  qc.invalidateQueries({ queryKey: [ARQUIVO_BLOB_KEY, pacienteId] });
}

export function useUploadArquivo(pacienteId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadArquivoPayload) => arquivoService.upload(pacienteId, payload),
    onSuccess: () => invalidateArquivos(qc, pacienteId),
  });
}

export function useUploadArquivoAtendimento(atendimentoId: number, pacienteId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadArquivoPayload) =>
      arquivoService.uploadAtendimento(atendimentoId, payload),
    onSuccess: () => {
      invalidateArquivos(qc, pacienteId);
      qc.invalidateQueries({ queryKey: [ARQUIVOS_KEY, pacienteId, undefined, atendimentoId] });
    },
  });
}

export function useExcluirArquivo(pacienteId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (arquivoId: number) => arquivoService.excluir(pacienteId, arquivoId),
    onSuccess: () => invalidateArquivos(qc, pacienteId),
  });
}
