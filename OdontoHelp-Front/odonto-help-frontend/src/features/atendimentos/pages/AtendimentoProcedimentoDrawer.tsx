import {
  Alert, Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
} from '@mui/material';
import { Close, AddOutlined } from '@mui/icons-material';
import { useEffect, useRef } from 'react';
import type { ItemPlano } from '../../planoTratamento/types';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProcedimentosAtivos } from '../../procedimentos/useProcedimentos';
import { SITUACAO_DENTE_LABELS } from '../types';
import type { ItemAtendimento, SituacaoDente } from '../types';

const schema = z.object({
  procedimentoId: z
    .union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Procedimento obrigatório' }),
  situacaoNova: z.string().min(1, 'Situação obrigatória'),
  observacao: z.string().optional().default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  dentes: number[];
  sugestaoPlano?: ItemPlano | null;
  onClose: () => void;
  onAddProcedimento: (itens: ItemAtendimento[]) => void;
}

export default function AtendimentoProcedimentoDrawer({
  open, dentes, sugestaoPlano, onClose, onAddProcedimento,
}: Props) {
  const localIdRef = useRef(-1);
  const { data: procedimentosData } = useProcedimentosAtivos();
  const procedimentos = procedimentosData?.content ?? [];

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      procedimentoId: '' as unknown as FormData['procedimentoId'],
      situacaoNova: '',
      observacao: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (sugestaoPlano) {
      reset({
        procedimentoId: sugestaoPlano.procedimentoId,
        situacaoNova: '',
        observacao: sugestaoPlano.observacao?.trim()
          || `Item do plano: ${sugestaoPlano.procedimentoNome}`,
      });
      return;
    }
    reset({
      procedimentoId: '' as unknown as FormData['procedimentoId'],
      situacaoNova: '',
      observacao: '',
    });
  }, [open, sugestaoPlano, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const proc = procedimentos.find((p) => p.id === data.procedimentoId);
    const novosItens: ItemAtendimento[] = dentes.map((numeroDente) => ({
      id: (localIdRef.current--),
      procedimentoId: data.procedimentoId as number,
      procedimentoNome: proc?.nome ?? '',
      numeroDente,
      situacaoNova: data.situacaoNova as SituacaoDente,
      observacao: data.observacao || null,
      ...(sugestaoPlano ? { itemPlanoOrigemId: sugestaoPlano.id } : {}),
    }));
    onAddProcedimento(novosItens);
    reset();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Adicionar procedimento
            </Typography>
            {dentes.length > 0 && (
              <Typography variant="caption" color="text.disabled">
                Dentes: {dentes.join(', ')}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
      </Box>

      <Divider />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 3, py: 2.5, flex: 1 }}>
          <Stack spacing={2}>
            {sugestaoPlano && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Sugestão do plano: dente {sugestaoPlano.numeroDente} — {sugestaoPlano.procedimentoNome}.
                Informe como o dente ficou após o procedimento.
              </Alert>
            )}
            <Controller
              name="procedimentoId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Procedimento *"
                  fullWidth
                  size="small"
                  error={!!errors.procedimentoId}
                  helperText={errors.procedimentoId?.message}
                >
                  {procedimentos.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="situacaoNova"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Como o dente ficou? *"
                  fullWidth
                  size="small"
                  error={!!errors.situacaoNova}
                  helperText={errors.situacaoNova?.message}
                >
                  {(Object.keys(SITUACAO_DENTE_LABELS) as SituacaoDente[]).map((s) => (
                    <MenuItem key={s} value={s}>{SITUACAO_DENTE_LABELS[s]}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="observacao"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Observação" fullWidth size="small" multiline minRows={2} />
              )}
            />
          </Stack>
        </Box>

        <Divider />
        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Adicionar</Button>
        </Box>
      </Box>
    </Drawer>
  );
}
