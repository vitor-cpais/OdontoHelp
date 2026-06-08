import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { WarningAmberOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../shared/store/authStore';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { usePacientes } from '../pacientes/usePacientes';
import { useDentistas } from '../dentistas/useDentistas';
import { useIniciarAtendimentoAvulso } from './useAtendimentos';

interface Props {
  open: boolean;
  onClose: () => void;
  pacienteIdPrefill?: number | null;
  onError?: (msg: string) => void;
}

export default function IniciarAtendimentoAvulsoDialog({
  open,
  onClose,
  pacienteIdPrefill = null,
  onError,
}: Props) {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const isAdmin = usuario?.perfil === 'ADMIN';

  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [dentistaId, setDentistaId] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const iniciarAvulso = useIniciarAtendimentoAvulso();

  const { data: pacientesData } = usePacientes(
    { page: 0, size: 100, isAtivo: true },
    { enabled: open },
  );
  const { data: dentistasData } = useDentistas(
    { page: 0, size: 100, isAtivo: true },
    { enabled: open && isAdmin },
  );

  const pacientes = pacientesData?.content ?? [];
  const dentistas = dentistasData?.content ?? [];
  const pacienteSelecionado = pacientes.find((p) => p.id === pacienteId) ?? null;
  const dentistaSelecionado = dentistas.find((d) => d.id === dentistaId) ?? null;

  useEffect(() => {
    if (!open) return;
    setPacienteId(pacienteIdPrefill ?? null);
    setDentistaId(isAdmin ? null : (usuario?.dentistaId ?? null));
    setMotivo('');
    setObservacoes('');
    setConfirmado(false);
  }, [open, pacienteIdPrefill, isAdmin, usuario?.dentistaId]);

  const handleClose = () => {
    if (iniciarAvulso.isPending) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!pacienteId) {
      onError?.('Selecione um paciente');
      return;
    }
    if (isAdmin && !dentistaId) {
      onError?.('Selecione um dentista');
      return;
    }
    if (!confirmado) {
      setConfirmado(true);
      return;
    }

    try {
      const atendimento = await iniciarAvulso.mutateAsync({
        pacienteId,
        dentistaId: isAdmin ? (dentistaId ?? undefined) : undefined,
        motivo: motivo.trim() || undefined,
        observacoesGerais: observacoes.trim() || undefined,
      });
      onClose();
      navigate(`/atendimentos/${atendimento.id}`);
    } catch (e: unknown) {
      onError?.(getApiErrorMessage(e, 'Erro ao iniciar atendimento avulso'));
      setConfirmado(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>
        Atendimento avulso
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Alert severity="warning" icon={<WarningAmberOutlined fontSize="small" />}>
            Use apenas em emergências ou conflito de agenda. O fluxo recomendado é criar um agendamento em{' '}
            <strong>Agendamentos</strong> e iniciar o atendimento a partir dele.
          </Alert>

          <Autocomplete
            options={pacientes}
            getOptionLabel={(o) => o.nome}
            value={pacienteSelecionado}
            onChange={(_, v) => setPacienteId(v?.id ?? null)}
            disabled={!!pacienteIdPrefill}
            renderInput={(params) => (
              <TextField {...params} label="Paciente *" size="small" />
            )}
          />

          {isAdmin && (
            <Autocomplete
              options={dentistas}
              getOptionLabel={(o) => o.nome}
              value={dentistaSelecionado}
              onChange={(_, v) => setDentistaId(v?.id ?? null)}
              renderInput={(params) => (
                <TextField {...params} label="Dentista *" size="small" />
              )}
            />
          )}

          <TextField
            label="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: emergência, paciente sem horário"
            size="small"
            inputProps={{ maxLength: 200 }}
          />

          <TextField
            label="Observações clínicas (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            multiline
            minRows={2}
            size="small"
          />

          {confirmado && (
            <Typography variant="body2" color="text.secondary">
              Confirme novamente para iniciar o atendimento avulso agora.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={iniciarAvulso.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={iniciarAvulso.isPending}
          startIcon={iniciarAvulso.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmado ? 'Iniciar mesmo assim' : 'Continuar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
