import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, Typography, Box,
  FormControlLabel, Checkbox,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  TIPO_ARQUIVO_LABELS, TIPOS_ATENDIMENTO, TIPOS_PACIENTE,
  type TipoArquivo,
} from './types';
import { useUploadArquivo, useUploadArquivoAtendimento } from './useArquivos';
import { getApiErrorMessage } from '../../shared/lib/axios';

type Contexto = 'paciente' | 'atendimento';

interface Props {
  open: boolean;
  pacienteId: number;
  atendimentoId?: number;
  contexto?: Contexto;
  tipoInicial?: TipoArquivo;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function ArquivoUploadDialog({
  open,
  pacienteId,
  atendimentoId,
  contexto = 'paciente',
  tipoInicial,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tipos = contexto === 'atendimento' ? TIPOS_ATENDIMENTO : TIPOS_PACIENTE;
  const defaultTipo = tipoInicial && tipos.includes(tipoInicial) ? tipoInicial : tipos[0];

  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoArquivo>(defaultTipo);
  const [descricao, setDescricao] = useState('');
  const [numeroDente, setNumeroDente] = useState('');
  const [principal, setPrincipal] = useState(false);

  const uploadPaciente = useUploadArquivo(pacienteId);
  const uploadAtendimento = useUploadArquivoAtendimento(atendimentoId ?? 0, pacienteId);
  const upload = contexto === 'atendimento' ? uploadAtendimento : uploadPaciente;

  useEffect(() => {
    if (open) {
      setTipo(defaultTipo);
      setPrincipal(tipoInicial === 'FOTO_PACIENTE');
    }
  }, [open, defaultTipo, tipoInicial]);

  const handleClose = () => {
    setFile(null);
    setDescricao('');
    setNumeroDente('');
    setPrincipal(false);
    setTipo(defaultTipo);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) {
      onError('Selecione um arquivo');
      return;
    }
    if (tipo === 'RADIOGRAFIA' && !numeroDente.trim()) {
      onError('Informe o número do dente (FDI) para radiografia');
      return;
    }
    try {
      const payload = {
        file,
        tipo,
        descricao: descricao || undefined,
        numeroDente: tipo === 'RADIOGRAFIA' ? Number(numeroDente) : undefined,
        principal: contexto === 'paciente' && tipo === 'FOTO_PACIENTE' ? principal : undefined,
      };
      await upload.mutateAsync(payload);
      onSuccess('Arquivo enviado com sucesso!');
      handleClose();
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao enviar arquivo'));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enviar arquivo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select label="Tipo *" value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoArquivo)}
            fullWidth
            disabled={!!tipoInicial}
          >
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>{TIPO_ARQUIVO_LABELS[t]}</MenuItem>
            ))}
          </TextField>

          {tipo === 'RADIOGRAFIA' && (
            <TextField
              label="Número do dente (FDI) *"
              type="number"
              value={numeroDente}
              onChange={(e) => setNumeroDente(e.target.value)}
              fullWidth
              inputProps={{ min: 11, max: 85 }}
            />
          )}

          {contexto === 'paciente' && tipo === 'FOTO_PACIENTE' && (
            <FormControlLabel
              control={<Checkbox checked={principal} onChange={(_, v) => setPrincipal(v)} />}
              label="Definir como foto principal (avatar do prontuário)"
            />
          )}

          <TextField
            label="Descrição (opcional)" value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth multiline minRows={2}
          />
          <Box>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="outlined" onClick={() => inputRef.current?.click()}>
              Escolher arquivo
            </Button>
            {file && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              JPEG, PNG, WebP ou PDF — máx. 10 MB (imagens) / 20 MB (PDF)
            </Typography>
            {tipo === 'DOCUMENTO_IDENTIDADE' && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                Dado sensível — armazene apenas o necessário (LGPD).
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={upload.isPending}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={upload.isPending || !file}>
          {upload.isPending ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
