import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
  Tooltip, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip,
} from '@mui/material';
import {
  Close, AssignmentOutlined, DeleteOutlined, ContentCopyOutlined,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { useCreatePlano, useItensPlanoPendentes } from './usePlanoTratamento';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';
import OdontogramaSelectionDialog from '../odontograma/OdontogramaSelectionDialog';
import { useOdontograma } from '../odontograma/useOdontograma';
import { SITUACAO_DENTE_LABELS, SITUACAO_DENTE_COLORS } from '../atendimentos/types';
import type { SituacaoDente } from '../atendimentos/types';
import { useProcedimentosAtivos } from '../procedimentos/useProcedimentos';
import { usePacientes } from '../pacientes/usePacientes';
import { useDentistas } from '../dentistas/useDentistas';
import { useAtendimentosPorPaciente } from '../atendimentos/useAtendimentos';
import type { PlanoFormData } from './types';

const DENTES_VALIDOS = new Set([
  11,12,13,14,15,16,17,18,
  21,22,23,24,25,26,27,28,
  31,32,33,34,35,36,37,38,
  41,42,43,44,45,46,47,48,
]);

const itemSchema = z.object({
  procedimentoId: z
    .union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Procedimento obrigatório' }),
  numeroDente: z
    .union([z.number(), z.literal('')])
    .refine((v) => v !== '' && DENTES_VALIDOS.has(Number(v)), {
      message: 'Selecione o dente no odontograma',
    }),
  prioridade: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal('')])
    .refine((v) => v !== '', { message: 'Prioridade obrigatória' }),
  observacao: z.string().optional().default(''),
});

const schema = z.object({
  pacienteId: z
    .union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Paciente obrigatório' }),
  dentistaId: z
    .union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Dentista obrigatório' }),
  atendimentoId: z.union([z.number().positive(), z.literal('')]).optional(),
  observacoes: z.string().optional().default(''),
  itens: z.array(itemSchema).min(1, 'Selecione ao menos um dente no odontograma'),
});

const ITEM_VAZIO = {
  procedimentoId: '' as const,
  numeroDente: '' as const,
  prioridade: 2 as const,
  observacao: '',
};

interface Props {
  open: boolean;
  pacienteId?: number;
  dentistaId?: number;
  atendimentoId?: number;
  selectedDentes?: number[];
  useDialog?: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function SituacaoDenteBadge({ situacao }: { situacao: SituacaoDente | null }) {
  if (!situacao) return null;
  const cor = SITUACAO_DENTE_COLORS[situacao];
  return (
    <Chip
      label={SITUACAO_DENTE_LABELS[situacao]}
      size="small"
      sx={{
        height: 22, fontSize: '0.68rem', fontWeight: 600,
        bgcolor: `${cor}18`, color: cor, border: `1px solid ${cor}44`,
      }}
    />
  );
}

export default function PlanoTratamentoDrawer({
  open, pacienteId, dentistaId, atendimentoId,
  selectedDentes, useDialog, onClose, onSuccess, onError,
}: Props) {
  const { data: procedimentosData } = useProcedimentosAtivos();
  const procedimentos = procedimentosData?.content ?? [];
  const create = useCreatePlano();
  const [odontogramaDialogOpen, setOdontogramaDialogOpen] = useState(false);

  const { data: pacientesData, isLoading: pacientesLoading } = usePacientes(
    { page: 0, size: 100, isAtivo: true }, { staleTime: 0 }
  );
  const pacientes = pacientesData?.content ?? [];
  const { data: dentistasData, isLoading: dentistasLoading } = useDentistas(
    { page: 0, size: 100, isAtivo: true }, { staleTime: 0 }
  );
  const dentistas = dentistasData?.content ?? [];

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PlanoFormData>({
    resolver: zodResolver(schema),
    defaultValues: { pacienteId: '', dentistaId: '', atendimentoId: '', observacoes: '', itens: [] },
  });

  const { fields, remove } = useFieldArray({ control, name: 'itens' });

  const watchedPacienteId = watch('pacienteId');
  const pacienteIdNumber = typeof watchedPacienteId === 'number' ? watchedPacienteId : null;
  const effectivePacienteId = pacienteId ?? pacienteIdNumber;
  const { data: atendimentosData, isLoading: atendimentosLoading } = useAtendimentosPorPaciente(pacienteIdNumber, 0);
  const atendimentos = atendimentosData?.content ?? [];
  const { data: itensPendentes } = useItensPlanoPendentes(effectivePacienteId);
  const { data: mapaOdontograma } = useOdontograma(effectivePacienteId);

  const watchedItens = watch('itens');
  const odontogramaDentes = watchedItens
    .map((i) => i.numeroDente)
    .filter((d): d is number => typeof d === 'number');

  const syncDentesToItens = useCallback((dentes: number[]) => {
    const current = watch('itens');
    const newItens = dentes.map((d) => {
      const existing = current.find((i) => i.numeroDente === d);
      return existing ?? { ...ITEM_VAZIO, numeroDente: d };
    });
    setValue('itens', newItens);
  }, [watch, setValue]);

  const handleDenteClick = (numero: number) => {
    const next = odontogramaDentes.includes(numero)
      ? odontogramaDentes.filter((d) => d !== numero)
      : [...odontogramaDentes, numero];
    syncDentesToItens(next);
  };

  const handleRemoverDente = (numero: number) => {
    syncDentesToItens(odontogramaDentes.filter((d) => d !== numero));
  };

  const handleSelecionarCarie = () => {
    const dentes = Object.values(mapaOdontograma ?? {})
      .filter((e) => e.situacaoAtual === 'CARIADO')
      .map((e) => e.numeroDente);
    syncDentesToItens([...new Set([...odontogramaDentes, ...dentes])]);
  };

  const handleSelecionarPendentes = () => {
    const dentes = itensPendentes?.map((i) => i.numeroDente) ?? [];
    syncDentesToItens([...new Set([...odontogramaDentes, ...dentes])]);
  };

  const handleAplicarATodos = () => {
    const itens = watch('itens');
    if (itens.length < 2) return;
    const first = itens[0];
    if (!first.procedimentoId || first.procedimentoId === '') return;
    setValue('itens', itens.map((item, i) => (
      i === 0 ? item : { ...item, procedimentoId: first.procedimentoId, prioridade: first.prioridade }
    )));
  };

  useEffect(() => {
    if (!open) return;
    const itensPreenchidos = selectedDentes && selectedDentes.length > 0
      ? selectedDentes.map((numeroDente) => ({ ...ITEM_VAZIO, numeroDente }))
      : [];

    reset({
      pacienteId: pacienteId ?? '',
      dentistaId: dentistaId ?? '',
      atendimentoId: atendimentoId ?? '',
      observacoes: '',
      itens: itensPreenchidos,
    });
  }, [open, pacienteId, dentistaId, atendimentoId, selectedDentes, reset]);

  const onSubmit = async (data: PlanoFormData) => {
    try {
      await create.mutateAsync(data);
      onSuccess('Plano de tratamento criado com sucesso!');
      onClose();
    } catch (e: any) {
      onError(getApiErrorMessage(e, 'Erro ao criar plano de tratamento'));
    }
  };

  const FormContent = () => (
    <Stack spacing={2.5}>
      {effectivePacienteId ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Selecionar dentes
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={handleSelecionarCarie}>Com cárie</Button>
              <Button size="small" variant="outlined" onClick={handleSelecionarPendentes}>Pendentes no plano</Button>
              <Button size="small" variant="outlined" onClick={() => setOdontogramaDialogOpen(true)}>Expandir</Button>
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Clique nos dentes para montar o plano. Cada dente selecionado vira um item abaixo.
          </Typography>
          {odontogramaDentes.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {odontogramaDentes.map((d) => (
                <Chip key={d} label={String(d)} size="small" onDelete={() => handleRemoverDente(d)} />
              ))}
            </Box>
          )}
          <OdontogramaVisual
            pacienteId={effectivePacienteId}
            selectedDentes={odontogramaDentes}
            onDenteClick={handleDenteClick}
            dentesPendentesPlano={itensPendentes?.map((i) => i.numeroDente) ?? []}
          />
          <Divider />
        </>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Selecione o paciente para exibir o odontograma e escolher os dentes.
        </Alert>
      )}

      <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados do plano</Typography>

      <Stack direction="row" spacing={1.5}>
        <Controller name="pacienteId" control={control} render={({ field }) => (
          <Autocomplete
            options={pacientes}
            getOptionLabel={(o: any) => o.nome}
            value={pacientes.find((p) => p.id === field.value) ?? null}
            onChange={(_, v) => field.onChange(v?.id ?? '')}
            disabled={!!pacienteId}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Paciente *"
                error={!!errors.pacienteId} helperText={errors.pacienteId?.message}
                InputProps={{ ...params.InputProps, endAdornment: <>{pacientesLoading && <CircularProgress size={20} />}{params.InputProps.endAdornment}</> }}
              />
            )}
          />
        )} />
        <Controller name="dentistaId" control={control} render={({ field }) => (
          <Autocomplete
            options={dentistas}
            getOptionLabel={(o: any) => o.nome}
            value={dentistas.find((d) => d.id === field.value) ?? null}
            onChange={(_, v) => field.onChange(v?.id ?? '')}
            disabled={!!dentistaId}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} label="Dentista *"
                error={!!errors.dentistaId} helperText={errors.dentistaId?.message}
                InputProps={{ ...params.InputProps, endAdornment: <>{dentistasLoading && <CircularProgress size={20} />}{params.InputProps.endAdornment}</> }}
              />
            )}
          />
        )} />
      </Stack>

      <Controller name="atendimentoId" control={control} render={({ field }) => (
        <Autocomplete
          options={atendimentos}
          getOptionLabel={(o: any) => `#${o.id} · ${new Date(o.horaInicio).toLocaleDateString('pt-BR')} · ${o.dentistaNome}`}
          value={atendimentos.find((a) => a.id === field.value) ?? null}
          onChange={(_, v) => field.onChange(v?.id ?? '')}
          disabled={!!atendimentoId || !pacienteIdNumber}
          renderInput={(params) => (
            <TextField {...params} label="Atendimento (opcional)"
              helperText="Vincula o plano a um atendimento existente"
              InputProps={{ ...params.InputProps, endAdornment: <>{atendimentosLoading && <CircularProgress size={20} />}{params.InputProps.endAdornment}</> }}
            />
          )}
        />
      )} />

      <Controller name="observacoes" control={control} render={({ field }) => (
        <TextField {...field} label="Observações gerais" multiline minRows={2} fullWidth inputProps={{ maxLength: 1000 }} />
      )} />

      <Divider />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          Itens do plano ({fields.length})
        </Typography>
        {fields.length >= 2 && (
          <Button size="small" startIcon={<ContentCopyOutlined sx={{ fontSize: 15 }} />} onClick={handleAplicarATodos}>
            Aplicar a todos
          </Button>
        )}
      </Box>

      {errors.itens?.root && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>{errors.itens.root.message}</Alert>
      )}

      {fields.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            Selecione os dentes no odontograma acima para montar o plano
          </Typography>
        </Box>
      ) : (
        fields.map((field, index) => {
          const numeroDente = watchedItens[index]?.numeroDente;
          const situacao = typeof numeroDente === 'number'
            ? (mapaOdontograma?.[numeroDente]?.situacaoAtual ?? 'SAUDAVEL')
            : null;
          return (
            <Box key={field.id} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`Dente ${numeroDente}`} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                  <SituacaoDenteBadge situacao={situacao as SituacaoDente} />
                </Stack>
                <Tooltip title="Remover dente">
                  <IconButton size="small" onClick={() => typeof numeroDente === 'number' && handleRemoverDente(numeroDente)} sx={{ color: 'error.main' }}>
                    <DeleteOutlined sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <Controller name={`itens.${index}.procedimentoId`} control={control} render={({ field: f }) => (
                    <TextField {...f} select label="Procedimento *" fullWidth
                      error={!!errors.itens?.[index]?.procedimentoId}
                      helperText={errors.itens?.[index]?.procedimentoId?.message}
                      onChange={(e) => f.onChange(Number(e.target.value))}>
                      {procedimentos.map((p) => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                    </TextField>
                  )} />
                  <Controller name={`itens.${index}.prioridade`} control={control} render={({ field: f }) => (
                    <TextField {...f} select label="Prioridade *" sx={{ width: 140 }}
                      error={!!errors.itens?.[index]?.prioridade}
                      helperText={errors.itens?.[index]?.prioridade?.message}
                      onChange={(e) => f.onChange(Number(e.target.value))}>
                      <MenuItem value={1}>Alta</MenuItem>
                      <MenuItem value={2}>Média</MenuItem>
                      <MenuItem value={3}>Baixa</MenuItem>
                    </TextField>
                  )} />
                </Stack>
                <Controller name={`itens.${index}.observacao`} control={control} render={({ field: f }) => (
                  <TextField {...f} label="Observação" fullWidth inputProps={{ maxLength: 500 }} />
                )} />
              </Stack>
            </Box>
          );
        })
      )}
    </Stack>
  );

  const odontogramaDialog = effectivePacienteId ? (
    <OdontogramaSelectionDialog
      open={odontogramaDialogOpen}
      pacienteId={effectivePacienteId}
      selectedDentes={odontogramaDentes}
      onClose={() => setOdontogramaDialogOpen(false)}
      onConfirm={(dentes) => { syncDentesToItens(dentes); setOdontogramaDialogOpen(false); }}
    />
  ) : null;

  if (useDialog) {
    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>Novo plano de tratamento</Typography>
            </Box>
            <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent dividers><FormContent /></DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={onClose} disabled={create.isPending}>Cancelar</Button>
            <Button variant="contained" disabled={create.isPending} onClick={handleSubmit(onSubmit)}>
              {create.isPending ? 'Salvando...' : 'Criar plano'}
            </Button>
          </DialogActions>
        </Dialog>
        {odontogramaDialog}
      </>
    );
  }

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 640 }, display: 'flex', flexDirection: 'column' } }}>
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssignmentOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
            </Box>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>Novo plano de tratamento</Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <Divider />
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          <FormContent />
        </Box>
        <Divider />
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" onClick={onClose} disabled={create.isPending}>Cancelar</Button>
          <Button variant="contained" disabled={create.isPending} onClick={handleSubmit(onSubmit)}>
            {create.isPending ? 'Criando...' : 'Criar plano'}
          </Button>
        </Box>
      </Drawer>
      {odontogramaDialog}
    </>
  );
}
