import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Stack, TextField, Typography, CircularProgress,
} from '@mui/material';
import { EmptyState } from '../../design-system/components';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { useUpdateAnamnese } from './usePacientes';

const MAX_LEN = 500;

interface Props {
  pacienteId: number;
  anamnese?: string | null;
  canEdit: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function PacienteAnamneseCard({
  pacienteId,
  anamnese,
  canEdit,
  onSuccess,
  onError,
}: Props) {
  const salvar = useUpdateAnamnese(pacienteId);
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(anamnese ?? '');

  useEffect(() => {
    if (!editing) setTexto(anamnese ?? '');
  }, [anamnese, editing]);

  const handleSalvar = async () => {
    try {
      await salvar.mutateAsync(texto);
      setEditing(false);
      onSuccess('Anamnese salva com sucesso!');
    } catch (e) {
      onError(getApiErrorMessage(e, 'Erro ao salvar anamnese'));
    }
  };

  const handleCancelar = () => {
    setTexto(anamnese ?? '');
    setEditing(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h3">Anamnese</Typography>
          <Typography variant="caption" color="text.secondary">
            Histórico clínico fixo: alergias, medicamentos, condições relevantes
          </Typography>
        </Box>
        {canEdit && !editing && (
          <Button size="small" variant="outlined" onClick={() => setEditing(true)}>
            {anamnese ? 'Editar' : 'Preencher'}
          </Button>
        )}
      </Stack>

      {editing ? (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <TextField
            multiline
            minRows={4}
            fullWidth
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, MAX_LEN))}
            placeholder="Ex.: alergia a lidocaína, hipertensão controlada, gestante..."
            helperText={`${texto.length}/${MAX_LEN}`}
            disabled={salvar.isPending}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={handleCancelar} disabled={salvar.isPending}>
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSalvar}
              disabled={salvar.isPending}
              startIcon={salvar.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              Salvar
            </Button>
          </Stack>
        </Stack>
      ) : anamnese ? (
        <Typography variant="body2" sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
          {anamnese}
        </Typography>
      ) : (
        <Box sx={{ mt: 1 }}>
          <EmptyState
            title="Anamnese não preenchida"
            description={canEdit ? 'Registre o histórico clínico base do paciente.' : undefined}
            actionLabel={canEdit ? 'Preencher anamnese' : undefined}
            onAction={canEdit ? () => setEditing(true) : undefined}
          />
        </Box>
      )}
    </Paper>
  );
}
