import {
  Drawer, Box, Typography, IconButton, Divider, TextField,
  Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Autocomplete, CircularProgress,
} from '@mui/material';
import { Close, CalendarMonthOutlined, WarningAmberOutlined, EditOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useAgendamentoDrawerStore } from './agendamentoStore';
import {
  useCreateAgendamento, useUpdateAgendamento,
  useAtualizarStatus, useCancelarAgendamento, useAgendamentos,
} from './useAgendamentos';
import StatusTransition from './StatusTransition';
import { STATUS_LABELS } from './types';
import type { AgendamentoFormData, StatusConsulta } from './types';
import { useDentistas } from '../dentistas/useDentistas';
import { usePacientes } from '../pacientes/usePacientes';

const schema = z.object({
  pacienteId: z.number({ invalid_type_error: 'Selecione um paciente' }).min(1, 'Paciente obrigatório'),
  dentistaId: z.number({ invalid_type_error: 'Selecione um dentista' }).min(1, 'Dentista obrigatório'),
  dataInicio: z.string().min(1, 'Data de início obrigatória'),
  dataFim: z.string().min(1, 'Data de fim obrigatória'),
  observacoes: z.string().max(500).optional().default(''),
  status: z.string().optional(),
}).refine(
  (d) => new Date(d.dataFim) > new Date(d.dataInicio),
  { message: 'Data fim deve ser após o início', path: ['dataFim'] }
);

const add30min = (dt: string): string => {
  const d = new Date(dt);
  d.setMinutes(d.getMinutes() + 30);
  return d.toISOString().slice(0, 16);
};

interface Props {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function AgendamentoDrawer({ onSuccess, onError }: Props) {
  const { open, mode, editingId, draft, hasChanges, clearDraft, setEditMode, setViewMode, setHasChanges } = useAgendamentoDrawerStore();
  const isNew = mode === 'new';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isFinalStatus = draft.status && ['CANCELADO', 'CONCLUIDO', 'FALTA'].includes(draft.status);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [conflito, setConflito] = useState<string | null>(null);

  const create = useCreateAgendamento();
  const update = useUpdateAgendamento(editingId ?? 0);
  const atualizarStatus = useAtualizarStatus();
  const cancelar = useCancelarAgendamento();

  const { data: dentistasData } = useDentistas({ page: 0, size: 100, isAtivo: true });
  const { data: pacientesData } = usePacientes({ page: 0, size: 100, isAtivo: true });
  const dentistas = dentistasData?.content ?? [];
  const pacientes = pacientesData?.content ?? [];

  const { data: agendamentosDentista } = useAgendamentos({
    page: 0, size: 100,
    dentistaId: draft.dentistaId ?? undefined,
    dataInicio: draft.dataInicio?.slice(0, 10),
    dataFim: draft.dataFim?.slice(0, 10),
  }, { enabled: !!draft.dentistaId && !!draft.dataInicio });

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<AgendamentoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: null as any, dentistaId: null as any,
      dataInicio: '', dataFim: '', observacoes: '', status: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      const inicio = draft.dataInicio ?? '';
      reset({
        pacienteId: draft.pacienteId ?? (null as any),
        dentistaId: draft.dentistaId ?? (null as any),
        dataInicio: inicio,
        dataFim: draft.dataFim ?? (inicio ? add30min(inicio) : ''),
        observacoes: draft.observacoes ?? '',
        status: draft.status,
      });
      setConflito(null);
    }
  }, [open, mode]);

  const watchedInicio = watch('dataInicio');
  const watchedFim = watch('dataFim');
  const watchedDentistaId = watch('dentistaId');

  // +30min automático quando fim está vazio
  useEffect(() => {
    if (watchedInicio && !watchedFim) setValue('dataFim', add30min(watchedInicio));
  }, [watchedInicio]);

  // Detecta se houve mudanças no modo edição
  useEffect(() => {
    if (isEdit) setHasChanges(isDirty);
  }, [isDirty, isEdit]);

  // Detecta conflito de horário
  useEffect(() => {
    if (!watchedInicio || !watchedFim || !watchedDentistaId) { setConflito(null); return; }
    const inicio = new Date(watchedInicio);
    const fim = new Date(watchedFim);
    const conflitante = agendamentosDentista?.content.find((a) => {
      if (editingId && a.id === editingId) return false;
      if (a.status === 'CANCELADO') return false;
      return inicio < new Date(a.dataFim) && fim > new Date(a.dataInicio);
    });
    setConflito(
      conflitante
        ? `Conflito com ${conflitante.pacienteNome} às ${new Date(conflitante.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : null
    );
  }, [watchedInicio, watchedFim, watchedDentistaId, agendamentosDentista]);

  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      if (isNew) {
        await create.mutateAsync(data);
        onSuccess('Agendamento criado com sucesso!');
      } else {
        await update.mutateAsync({ dataInicio: data.dataInicio, dataFim: data.dataFim, observacoes: data.observacoes });
        onSuccess('Agendamento atualizado com sucesso!');
      }
      clearDraft();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao salvar agendamento');
    }
  };

  const handleStatusChange = async (status: StatusConsulta) => {
    if (!editingId) return;
    try {
      await atualizarStatus.mutateAsync({ id: editingId, status });
      onSuccess(`Status atualizado para ${STATUS_LABELS[status]}`);
      clearDraft();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao atualizar status');
    }
  };

  const handleCancelar = async () => {
    if (!editingId) return;
    try {
      await cancelar.mutateAsync(editingId);
      onSuccess('Agendamento cancelado!');
      setConfirmCancel(false);
      clearDraft();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao cancelar');
    }
  };

  const loading = create.isPending || update.isPending || atualizarStatus.isPending;
  const fieldsDisabled = isView || !!isFinalStatus;

  const drawerTitle = isNew ? 'Novo agendamento' : isEdit ? 'Editar agendamento' : 'Agendamento';

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={clearDraft}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarMonthOutlined sx={{ fontSize: 17, color: '#854F0B' }} />
            </Box>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              {drawerTitle}
            </Typography>
          </Box>
          <IconButton size="small" onClick={clearDraft} disabled={loading}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

        {/* Form */}
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>

            {conflito && !isView && (
              <Alert severity="warning" icon={<WarningAmberOutlined fontSize="small" />}
                sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                {conflito}
              </Alert>
            )}

            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Paciente e dentista</Typography>

            <Controller name="pacienteId" control={control} render={({ field }) => (
              <Autocomplete
                options={pacientes}
                getOptionLabel={(o) => o.nome}
                value={pacientes.find((p) => p.id === field.value) ?? null}
                onChange={(_, v) => field.onChange(v?.id ?? null)}
                disabled={fieldsDisabled || !!editingId}
                renderInput={(params) => (
                  <TextField {...params} label="Paciente *" error={!!errors.pacienteId}
                    helperText={errors.pacienteId?.message} size="small" />
                )}
              />
            )} />

            <Controller name="dentistaId" control={control} render={({ field }) => (
              <Autocomplete
                options={dentistas}
                getOptionLabel={(o) => o.nome}
                value={dentistas.find((d) => d.id === field.value) ?? null}
                onChange={(_, v) => field.onChange(v?.id ?? null)}
                disabled={fieldsDisabled}
                renderInput={(params) => (
                  <TextField {...params} label="Dentista *" error={!!errors.dentistaId}
                    helperText={errors.dentistaId?.message} size="small" />
                )}
              />
            )} />

            <Divider />
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Horário</Typography>

            <Stack direction="row" spacing={1.5}>
              <Controller name="dataInicio" control={control} render={({ field }) => (
                <TextField {...field} label="Início *" type="datetime-local"
                  error={!!errors.dataInicio} helperText={errors.dataInicio?.message}
                  fullWidth InputLabelProps={{ shrink: true }} size="small"
                  disabled={fieldsDisabled} />
              )} />
              <Controller name="dataFim" control={control} render={({ field }) => (
                <TextField {...field} label="Fim *" type="datetime-local"
                  error={!!errors.dataFim} helperText={errors.dataFim?.message}
                  fullWidth InputLabelProps={{ shrink: true }} size="small"
                  disabled={fieldsDisabled} />
              )} />
            </Stack>

            <Divider />
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Observações</Typography>

            <Controller name="observacoes" control={control} render={({ field }) => (
              <TextField {...field} label="Observações" multiline rows={3} fullWidth
                inputProps={{ maxLength: 500 }}
                helperText={`${field.value?.length ?? 0}/500`} size="small"
                disabled={fieldsDisabled} />
            )} />

            {/* Status — só no modo visualização */}
            {isView && draft.status && (
              <>
                <Divider />
                <StatusTransition
                  statusAtual={draft.status as StatusConsulta}
                  onStatusChange={handleStatusChange}
                  loading={atualizarStatus.isPending}
                />
              </>
            )}

          </Stack>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Esquerda */}
          <Box>
            {isView && !isFinalStatus && (
              <Button size="small" color="error" onClick={() => setConfirmCancel(true)} disabled={loading}>
                Cancelar agendamento
              </Button>
            )}
            {isEdit && (
              <Button size="small" color="inherit" onClick={() => { reset(); setViewMode(); }}
                sx={{ color: 'text.secondary' }}>
                {hasChanges ? 'Cancelar edição' : 'Voltar'}
              </Button>
            )}
          </Box>

          {/* Direita */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {loading && <CircularProgress size={16} />}

            {isView && !isFinalStatus && (
              <Button variant="outlined" startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                onClick={setEditMode} size="small">
                Editar
              </Button>
            )}

            {isNew && (
              <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
                {loading ? 'Salvando...' : 'Agendar'}
              </Button>
            )}

            {isEdit && (
              <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      {/* Confirmar cancelamento */}
      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 500 }}>Cancelar agendamento?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta ação não pode ser desfeita. O agendamento será removido.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmCancel(false)}>Voltar</Button>
          <Button variant="contained" color="error" onClick={handleCancelar}>
            Confirmar cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
