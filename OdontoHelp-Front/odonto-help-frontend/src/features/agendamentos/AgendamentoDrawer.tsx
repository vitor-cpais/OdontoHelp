import {
  Drawer, Box, Typography, IconButton, Divider, TextField,
  Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Autocomplete, Chip, CircularProgress,
} from '@mui/material';
import { Close, CalendarMonthOutlined, WarningAmberOutlined, EditOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { useAgendamentoDrawerStore } from './agendamentoStore';
import { getApiErrorMessage } from '../../shared/lib/axios';
import {
  useCreateAgendamento, useUpdateAgendamento,
  useCancelarAgendamento, useAgendamentos,
  useAtualizarStatusAgendamentoComItens,
  STATUS_LABELS,
} from '../../domains/agendamentos';
import type { AgendamentoFormData, StatusConsulta } from '../../domains/agendamentos';
import { useIniciarAtendimento } from '../atendimentos/useAtendimentos';
import StatusTransition from './StatusTransition';
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
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const perfil = usuario?.perfil;
  const podeIniciarClinico = perfil === 'ADMIN' || perfil === 'DENTISTA';
  const { open, mode, editingId, draft, hasChanges, clearDraft, setEditMode, setViewMode, setHasChanges } = useAgendamentoDrawerStore();
  const isNew = mode === 'new';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isFinalStatus = draft.status && ['CANCELADO', 'ATENDIDO', 'FALTA'].includes(draft.status);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [conflito, setConflito] = useState<string | null>(null);
  const submitKeyRef = useRef<string | null>(null);

  const create = useCreateAgendamento();
  const update = useUpdateAgendamento(editingId ?? 0);
  const atualizarStatusComItens = useAtualizarStatusAgendamentoComItens();
  const cancelar = useCancelarAgendamento();
  const iniciarAtendimento = useIniciarAtendimento();

  const { data: dentistasData } = useDentistas(
  { page: 0, size: 100, isAtivo: true },
  { staleTime: 0 }
  );
  const { data: pacientesData } = usePacientes(
  { page: 0, size: 100, isAtivo: true },
  { staleTime: 0 }
  );
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
      submitKeyRef.current = null;
      const inicio = draft.dataInicio ?? '';
      const dentistaPadrao =
        draft.dentistaId ??
        (perfil === 'DENTISTA' && usuario?.dentistaId ? usuario.dentistaId : null);
      reset({
        pacienteId: draft.pacienteId ?? (null as any),
        dentistaId: dentistaPadrao ?? (null as any),
        dataInicio: inicio,
        dataFim: draft.dataFim ?? (inicio ? add30min(inicio) : ''),
        observacoes: draft.observacoes ?? '',
        status: draft.status,
      });
      setConflito(null);
    }
  }, [open, mode, draft.dataInicio, draft.dataFim, draft.pacienteId, draft.dentistaId, draft.observacoes, draft.status]);

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
    if (conflito) {
      onError('Resolva o conflito de horário antes de salvar');
      return;
    }
    if (!submitKeyRef.current) {
      submitKeyRef.current = crypto.randomUUID();
    }
    try {
      if (isNew) {
        await create.mutateAsync({ data, idempotencyKey: submitKeyRef.current });
        onSuccess('Agendamento criado com sucesso!');
      } else {
        await update.mutateAsync({ dataInicio: data.dataInicio, dataFim: data.dataFim, observacoes: data.observacoes });
        onSuccess('Agendamento atualizado com sucesso!');
      }
      submitKeyRef.current = null;
      clearDraft();
    } catch (e: any) {
      onError(getApiErrorMessage(e, 'Erro ao salvar agendamento'));
    }
  };

  const handleStatusChange = async (status: StatusConsulta) => {
    if (!editingId) return;
    try {
      await atualizarStatusComItens.mutateAsync({
        agendamentoId: editingId,
        pacienteId: draft.pacienteId ?? 0,
        status,
      });
      onSuccess(`Status atualizado para ${STATUS_LABELS[status]}`);
      clearDraft();
    } catch (e: any) {
      onError(getApiErrorMessage(e, 'Erro ao atualizar status'));
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
      onError(getApiErrorMessage(e, 'Erro ao cancelar'));
    }
  };

  const handleIniciarAtendimento = async () => {
    if (!editingId) return;
    try {
      const atendimento = await iniciarAtendimento.mutateAsync({
        agendamentoId: editingId,
        observacoesGerais: draft.observacoes,
      });
      clearDraft();
      navigate(`/atendimentos/${atendimento.id}`);
    } catch (e: unknown) {
      onError(getApiErrorMessage(e, 'Erro ao iniciar atendimento'));
    }
  };

  const isAvulso = draft.origem === 'AVULSA';
  const loading = create.isPending || update.isPending || atualizarStatusComItens.isPending || iniciarAtendimento.isPending;
  const fieldsDisabled = isView || !!isFinalStatus || isAvulso;

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

            {isAvulso && (
              <Chip
                label="Consulta avulsa"
                size="small"
                sx={{ alignSelf: 'flex-start', bgcolor: '#FAEEDA', color: '#854F0B', border: '1px solid #FAC775' }}
              />
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
                disabled={fieldsDisabled || (perfil === 'DENTISTA' && !!usuario?.dentistaId)}
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
            {isView && !isFinalStatus && !isAvulso && (
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

            {isView && draft.status === 'AGENDADO' && (
              <Button variant="outlined" onClick={() => handleStatusChange('CONFIRMADO')}
                disabled={loading} size="small">
                Confirmar
              </Button>
            )}

            {isView && draft.status === 'CONFIRMADO' && (
              <Button variant="outlined" color="warning" onClick={() => handleStatusChange('FALTA')}
                disabled={loading} size="small">
                Registrar falta
              </Button>
            )}

            {isView && podeIniciarClinico && draft.status === 'CONFIRMADO' && (
              <Button variant="contained" color="success" onClick={handleIniciarAtendimento}
                disabled={loading}>
                Iniciar Atendimento
              </Button>
            )}

            {isView && !isFinalStatus && !isAvulso && (
              <Button variant="outlined" startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                onClick={setEditMode} size="small">
                Editar
              </Button>
            )}

            {isNew && (
              <Button variant="contained" disabled={loading || !!conflito} onClick={handleSubmit(onSubmit)}>
                {loading ? 'Salvando...' : 'Agendar'}
              </Button>
            )}

            {isEdit && (
              <Button variant="contained" disabled={loading || !!conflito} onClick={handleSubmit(onSubmit)}>
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
