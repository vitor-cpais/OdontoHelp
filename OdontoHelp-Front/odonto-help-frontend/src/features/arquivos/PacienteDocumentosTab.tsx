import {
  Box, Button, Chip, Grid, IconButton, MenuItem, Paper,
  Skeleton, Stack, TextField, Typography, Dialog, DialogContent,
} from '@mui/material';
import { AddOutlined, Close, DeleteOutlined, DownloadOutlined, PictureAsPdfOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useArquivos, useExcluirArquivo } from './useArquivos';
import ArquivoUploadDialog from './ArquivoUploadDialog';
import ArquivoBlobImage from './ArquivoBlobImage';
import { arquivoService } from './arquivoService';
import { TIPO_ARQUIVO_LABELS, type TipoArquivo, type ArquivoPaciente } from './types';
import { getApiErrorMessage } from '../../shared/lib/axios';

interface Props {
  pacienteId: number;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function formatTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArquivoCard({
  arquivo, onPreview, onDownload, onDelete, deleting,
}: {
  arquivo: ArquivoPaciente;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const isImage = arquivo.mimeType.startsWith('image/');
  const isPdf = arquivo.mimeType === 'application/pdf';

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          height: 140, bgcolor: 'background.default', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
        onClick={onPreview}
      >
        {isImage ? (
          <ArquivoBlobImage
            pacienteId={arquivo.pacienteId}
            arquivoId={arquivo.id}
            alt={arquivo.nomeOriginal}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : isPdf ? (
          <PictureAsPdfOutlined sx={{ fontSize: 48, color: 'error.main' }} />
        ) : null}
      </Box>
      <Box sx={{ p: 1.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>
          {arquivo.nomeOriginal}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
          <Chip label={TIPO_ARQUIVO_LABELS[arquivo.tipo]} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
          {arquivo.principal && (
            <Chip label="Principal" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
          {arquivo.numeroDente != null && (
            <Chip label={`Dente ${arquivo.numeroDente}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
        </Stack>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
          {formatTamanho(arquivo.tamanhoBytes)} · {new Date(arquivo.criadoEm).toLocaleDateString('pt-BR')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <IconButton size="small" onClick={onDownload} aria-label="Baixar arquivo">
            <DownloadOutlined sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" color="error" disabled={deleting} onClick={onDelete} aria-label="Excluir arquivo">
            <DeleteOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function PacienteDocumentosTab({ pacienteId, onSuccess, onError }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<TipoArquivo | ''>('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<ArquivoPaciente | null>(null);

  const { data: arquivos, isLoading } = useArquivos(pacienteId, { tipo: filtroTipo || undefined });
  const excluir = useExcluirArquivo(pacienteId);

  const handleDelete = async (arquivo: ArquivoPaciente) => {
    if (!window.confirm(`Excluir "${arquivo.nomeOriginal}"?`)) return;
    try {
      await excluir.mutateAsync(arquivo.id);
      onSuccess('Arquivo excluído');
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao excluir arquivo'));
    }
  };

  const abrirPdf = async (arquivo: ArquivoPaciente) => {
    try {
      const blob = await arquivoService.downloadBlob(arquivo.pacienteId, arquivo.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao abrir PDF'));
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <TextField
          select size="small" label="Filtrar tipo" value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoArquivo | '')}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(TIPO_ARQUIVO_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={() => setUploadOpen(true)} sx={{ ml: { sm: 'auto' } }}>
          Enviar arquivo
        </Button>
      </Stack>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rounded" height={200} /></Grid>
          ))}
        </Grid>
      ) : !arquivos?.length ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">Nenhum arquivo neste paciente</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {arquivos.map((a) => (
            <Grid item xs={6} sm={4} md={3} key={a.id}>
              <ArquivoCard
                arquivo={a}
                onPreview={() => setPreview(a)}
                onDownload={() => handleDownload(a)}
                onDelete={() => handleDelete(a)}
                deleting={excluir.isPending}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ArquivoUploadDialog
        open={uploadOpen}
        pacienteId={pacienteId}
        onClose={() => setUploadOpen(false)}
        onSuccess={onSuccess}
        onError={onError}
      />

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, p: 1 }}>
          {preview && (
            <IconButton onClick={() => handleDownload(preview)} aria-label="Baixar arquivo">
              <DownloadOutlined />
            </IconButton>
          )}
          <IconButton onClick={() => setPreview(null)} aria-label="Fechar"><Close /></IconButton>
        </Box>
        <DialogContent sx={{ pt: 0 }}>
          {preview?.mimeType.startsWith('image/') && (
            <>
              <ArquivoBlobImage
                pacienteId={preview.pacienteId}
                arquivoId={preview.id}
                alt={preview.nomeOriginal}
                sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
              <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadOutlined />}
                  onClick={() => handleDownload(preview)}
                >
                  Baixar foto
                </Button>
              </Stack>
            </>
          )}
          {preview?.mimeType === 'application/pdf' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PictureAsPdfOutlined sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 2 }}>{preview.nomeOriginal}</Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="outlined" onClick={() => abrirPdf(preview)}>
                  Abrir PDF
                </Button>
                <Button variant="contained" startIcon={<DownloadOutlined />} onClick={() => handleDownload(preview)}>
                  Baixar PDF
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
