// src/features/procedimentos/ProcedimentoDrawer.tsx
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment,
} from '@mui/material';
import { Close, MedicalInformationOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useProcedimentoDrawerStore } from './procedimentoStore';
import { useCreateProcedimento, useUpdateProcedimento } from './useProcedimentos';
import type { ProcedimentoFormData } from './types';

const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  descricao: z.string().optional().default(''),
  valorBase: z
    .union([z.number(), z.literal('')])
    .refine((v) => v !== '' && Number(v) > 0, { message: 'Valor deve ser maior que zero' }),
  duracaoMinutos: z
    .union([z.number(), z.literal('')])
    .refine((v) => v !== '' && Number(v) > 0, { message: 'Duração deve ser maior que zero' }),
  corLegenda: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida — use #RRGGBB')
    .or(z.literal('')),
});

interface Props {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function ProcedimentoDrawer({ onSuccess, onError }: Props) {
  const { open, editingId, draft, hasDraft, clearDraft, updateDraft } = useProcedimentoDrawerStore();
  const isEditing = editingId !== null;
  const [confirmClose, setConfirmClose] = useState(false);

  const create = useCreateProcedimento();
  const update = useUpdateProcedimento(editingId ?? 0);

  const {
    control, handleSubmit, reset, watch,
    formState: { errors, isDirty },
  } = useForm<ProcedimentoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorBase: '',
      duracaoMinutos: '',
      corLegenda: '#0F6E56',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: draft.nome ?? '',
        descricao: draft.descricao ?? '',
        valorBase: draft.valorBase ?? '',
        duracaoMinutos: draft.duracaoMinutos ?? '',
        corLegenda: draft.corLegenda ?? '#0F6E56',
      });
    }
  }, [open]);

  const values = watch();
  useEffect(() => {
    if (open) updateDraft(values);
  }, [JSON.stringify(values), open]);

  const handleClose = () => {
    if (isDirty && !isEditing) setConfirmClose(true);
    else clearDraft();
  };

  const onSubmit = async (data: ProcedimentoFormData) => {
    try {
      if (isEditing) {
        await update.mutateAsync(data);
        onSuccess('Procedimento atualizado com sucesso!');
      } else {
        await create.mutateAsync(data);
        onSuccess('Procedimento cadastrado com sucesso!');
      }
      clearDraft();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao salvar procedimento');
    }
  };

  const loading = create.isPending || update.isPending;
  const corWatch = watch('corLegenda');

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 440 }, display: 'flex', flexDirection: 'column' },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MedicalInformationOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {isEditing ? 'Editar procedimento' : 'Novo procedimento'}
              </Typography>
              {hasDraft && !isEditing && (
                <Typography variant="caption" sx={{ color: '#BA7517' }}>rascunho salvo</Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

        {/* Form */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}
        >
          <Stack spacing={2.5}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados do procedimento</Typography>

            <Controller name="nome" control={control} render={({ field }) => (
              <TextField
                {...field}
                label="Nome *"
                error={!!errors.nome}
                helperText={errors.nome?.message}
                fullWidth
                inputProps={{ maxLength: 120 }}
              />
            )} />

            <Controller name="descricao" control={control} render={({ field }) => (
              <TextField
                {...field}
                label="Descrição"
                multiline
                minRows={2}
                fullWidth
                inputProps={{ maxLength: 500 }}
                helperText="Opcional"
              />
            )} />

            <Stack direction="row" spacing={1.5}>
              <Controller name="valorBase" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label="Valor base *"
                  type="number"
                  error={!!errors.valorBase}
                  helperText={errors.valorBase?.message}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: '0.01' }}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                />
              )} />

              <Controller name="duracaoMinutos" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label="Duração *"
                  type="number"
                  error={!!errors.duracaoMinutos}
                  helperText={errors.duracaoMinutos?.message}
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  }}
                  inputProps={{ min: 1, step: 1 }}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                />
              )} />
            </Stack>

            <Divider />
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Legenda no calendário</Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Controller name="corLegenda" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label="Cor (#RRGGBB)"
                  error={!!errors.corLegenda}
                  helperText={errors.corLegenda?.message ?? 'Ex: #0F6E56'}
                  fullWidth
                  inputProps={{ maxLength: 7 }}
                />
              )} />
              {/* Preview da cor */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(corWatch) ? corWatch : '#E0E0E0',
                }}
              />
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.disabled', mt: -1 }}>
              * Campos obrigatórios
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
            {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
        </Box>
      </Drawer>

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 500 }}>Descartar rascunho?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Você tem alterações não salvas. Ao fechar, o rascunho será descartado.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmClose(false)}>Continuar editando</Button>
          <Button variant="contained" color="error"
            onClick={() => { setConfirmClose(false); clearDraft(); }}>
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
