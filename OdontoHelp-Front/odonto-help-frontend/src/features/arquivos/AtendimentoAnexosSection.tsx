import {
  Box, Button, Chip, Grid, IconButton, Paper, Skeleton,
  Stack, Typography,
} from '@mui/material';
import { AddOutlined, DeleteOutlined, DownloadOutlined, PictureAsPdfOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useArquivos, useExcluirArquivo } from './useArquivos';
import ArquivoUploadDialog from './ArquivoUploadDialog';
import ArquivoBlobImage from './ArquivoBlobImage';
import { arquivoService } from './arquivoService';
import { TIPO_ARQUIVO_LABELS, type ArquivoPaciente } from './types';
import { getApiErrorMessage } from '../../shared/lib/axios';

interface Props {
  pacienteId: number;
  atendimentoId: number;
  somenteLeitura?: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function AtendimentoAnexosSection({
  pacienteId,
  atendimentoId,
  somenteLeitura = false,
  onSuccess,
  onError,
}: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: arquivos, isLoading } = useArquivos(pacienteId, { atendimentoId });
  const excluir = useExcluirArquivo(pacienteId);

  const handleDelete = async (arquivo: ArquivoPaciente) => {
    if (!window.confirm(`Excluir "${arquivo.nomeOriginal}"?`)) return;
    try {
      await excluir.mutateAsync(arquivo.id);
      onSuccess('Anexo excluído');
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao excluir anexo'));
    }
  };

  const abrirArquivo = async (arquivo: ArquivoPaciente) => {
    try {
      const blob = await arquivoService.downloadBlob(arquivo.pacienteId, arquivo.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao abrir arquivo'));
    }
  };

  const handleDownload = async (arquivo: ArquivoPaciente) => {
    try {
      await arquivoService.download(arquivo);
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao baixar arquivo'));
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Anexos do atendimento</Typography>
        {!somenteLeitura && (
          <Button size="small" variant="outlined" startIcon={<AddOutlined />} onClick={() => setUploadOpen(true)}>
            Adicionar anexo
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Skeleton variant="rounded" height={120} />
      ) : !arquivos?.length ? (
        <Typography variant="body2" color="text.disabled">
          Nenhum anexo neste atendimento.
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {arquivos.map((arquivo) => (
            <Grid item xs={12} sm={6} md={4} key={arquivo.id}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 56, height: 56, flexShrink: 0, borderRadius: 1,
                    bgcolor: 'background.default', overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => abrirArquivo(arquivo)}
                >
                  {arquivo.mimeType.startsWith('image/') ? (
                    <ArquivoBlobImage
                      pacienteId={arquivo.pacienteId}
                      arquivoId={arquivo.id}
                      alt={arquivo.nomeOriginal}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <PictureAsPdfOutlined color="error" />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} noWrap display="block">
                    {arquivo.nomeOriginal}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    <Chip label={TIPO_ARQUIVO_LABELS[arquivo.tipo]} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    {arquivo.numeroDente != null && (
                      <Chip label={`Dente ${arquivo.numeroDente}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0}>
                  <IconButton size="small" onClick={() => handleDownload(arquivo)} aria-label="Baixar anexo">
                    <DownloadOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                  {!somenteLeitura && (
                    <IconButton size="small" color="error" onClick={() => handleDelete(arquivo)} aria-label="Excluir anexo">
                      <DeleteOutlined sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <ArquivoUploadDialog
        open={uploadOpen}
        pacienteId={pacienteId}
        atendimentoId={atendimentoId}
        contexto="atendimento"
        onClose={() => setUploadOpen(false)}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Box>
  );
}
