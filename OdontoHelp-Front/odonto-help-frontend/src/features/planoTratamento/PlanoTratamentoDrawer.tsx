// src/features/planoTratamento/PlanoTratamentoDrawer.tsx
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
  Tooltip, Alert,
} from '@mui/material';
import {
  Close, AssignmentOutlined, AddOutlined, DeleteOutlined,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useCreatePlano } from './usePlanoTratamento';
import { useProcedimentosAtivos } from '../procedimentos/useProcedimentos';
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
      message: 'Dente inválido (FDI 11-48)',
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
  itens: z.array(itemSchema).min(1, 'Adicione ao menos um item'),
});

const ITEM_VAZIO = {
  procedimentoId: '' as const,
  numeroDente: '' as const,
  prioridade: 2 as const,
  observacao: '',
};

interface Props {
  open: boolean;
  /** Pré-preenche paciente e dentista ao criar a partir de tela do paciente */
  pacienteId?: number;
  dentistaId?: number;
  atendimentoId?: number;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function PlanoTratamentoDrawer({
  open, pacienteId, dentistaId, atendimentoId, onClose, onSuccess, onError,
}: Props) {
  const { data: procedimentosData } = useProcedimentosAtivos();
  const procedimentos = procedimentosData?.content ?? [];
  const create = useCreatePlano();

  const {
    control, handleSubmit, reset,
    formState: { errors },
  } = useForm<PlanoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: '',
      dentistaId: '',
      atendimentoId: '',
      observacoes: '',
      itens: [ITEM_VAZIO],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });

  useEffect(() => {
    if (!open) return;
    reset({
      pacienteId: pacienteId ?? '',
      dentistaId: dentistaId ?? '',
      atendimentoId: atendimentoId ?? '',
      observacoes: '',
      itens: [ITEM_VAZIO],
    });
  }, [open]);

  const onSubmit = async (data: PlanoFormData) => {
    try {
      await create.mutateAsync(data);
      onSuccess('Plano de tratamento criado com sucesso!');
      onClose();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao criar plano de tratamento');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 580 }, display: 'flex', flexDirection: 'column' },
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
            <AssignmentOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Novo plano de tratamento
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider />

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}
      >
        <Stack spacing={2.5}>
          <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados do plano</Typography>

          <Stack direction="row" spacing={1.5}>
            <Controller name="pacienteId" control={control} render={({ field }) => (
              <TextField
                {...field}
                label="ID do paciente *"
                type="number"
                error={!!errors.pacienteId}
                helperText={errors.pacienteId?.message}
                fullWidth
                disabled={!!pacienteId}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              />
            )} />

            <Controller name="dentistaId" control={control} render={({ field }) => (
              <TextField
                {...field}
                label="ID do dentista *"
                type="number"
                error={!!errors.dentistaId}
                helperText={errors.dentistaId?.message}
                fullWidth
                disabled={!!dentistaId}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              />
            )} />
          </Stack>

          <Controller name="atendimentoId" control={control} render={({ field }) => (
            <TextField
              {...field}
              label="ID do atendimento (opcional)"
              type="number"
              fullWidth
              disabled={!!atendimentoId}
              helperText="Vincula o plano a um atendimento existente"
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
          )} />

          <Controller name="observacoes" control={control} render={({ field }) => (
            <TextField
              {...field}
              label="Observações gerais"
              multiline
              minRows={2}
              fullWidth
              inputProps={{ maxLength: 1000 }}
            />
          )} />

          <Divider />

          {/* Itens */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Itens do plano ({fields.length})
            </Typography>
            <Button
              size="small"
              startIcon={<AddOutlined sx={{ fontSize: 15 }} />}
              onClick={() => append(ITEM_VAZIO)}
              sx={{ fontSize: '0.8rem' }}
            >
              Adicionar item
            </Button>
          </Box>

          {errors.itens?.root && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {errors.itens.root.message}
            </Alert>
          )}

          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{
                p: 2, borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Item {index + 1}
                </Typography>
                {fields.length > 1 && (
                  <Tooltip title="Remover item">
                    <IconButton size="small" onClick={() => remove(index)} sx={{ color: 'error.main' }}>
                      <DeleteOutlined sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <Controller
                    name={`itens.${index}.procedimentoId`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        select
                        label="Procedimento *"
                        error={!!errors.itens?.[index]?.procedimentoId}
                        helperText={errors.itens?.[index]?.procedimentoId?.message}
                        fullWidth
                        onChange={(e) => f.onChange(Number(e.target.value))}
                      >
                        {procedimentos.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name={`itens.${index}.numeroDente`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Dente (FDI) *"
                        type="number"
                        error={!!errors.itens?.[index]?.numeroDente}
                        helperText={errors.itens?.[index]?.numeroDente?.message ?? '11–48'}
                        sx={{ width: 130 }}
                        inputProps={{ min: 11, max: 48 }}
                        onChange={(e) => f.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name={`itens.${index}.prioridade`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        select
                        label="Prioridade *"
                        error={!!errors.itens?.[index]?.prioridade}
                        helperText={errors.itens?.[index]?.prioridade?.message}
                        sx={{ width: 130 }}
                        onChange={(e) => f.onChange(Number(e.target.value))}
                      >
                        <MenuItem value={1}>Alta</MenuItem>
                        <MenuItem value={2}>Média</MenuItem>
                        <MenuItem value={3}>Baixa</MenuItem>
                      </TextField>
                    )}
                  />
                </Stack>

                <Controller
                  name={`itens.${index}.observacao`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      {...f}
                      label="Observação"
                      fullWidth
                      inputProps={{ maxLength: 500 }}
                    />
                  )}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={create.isPending}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={create.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          {create.isPending ? 'Criando...' : 'Criar plano'}
        </Button>
      </Box>
    </Drawer>
  );
}
