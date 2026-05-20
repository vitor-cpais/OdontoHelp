import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack, Alert,
} from '@mui/material';
import { Close, AddOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProcedimentosAtivos } from '../../procedimentos/useProcedimentos';
import { SITUACAO_DENTE_LABELS, FACE_DENTE_LABELS } from '../types';
import type { ItemAtendimento, FaceDente, SituacaoDente } from '../types';

const schema = z.object({
  procedimentoId: z
    .union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Procedimento obrigatório' }),
  situacaoIdentificada: z.string().min(1, 'Situação obrigatória'),
  face: z.string().optional().default(''),
  observacao: z.string().optional().default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  dentes: number[];
  onClose: () => void;
  onAddProcedimento: (itens: ItemAtendimento[]) => void;
}

export default function AtendimentoProcedimentoDrawer({
  open, dentes, onClose, onAddProcedimento,
}: Props) {
  const localIdRef = useRef(-1);
  const { data: procedimentosData } = useProcedimentosAtivos();
  const procedimentos = procedimentosData?.content ?? [];

  const {
    control, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      procedimentoId: '',
      situacaoIdentificada: '',
      face: '',
      observacao: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const proc = procedimentos.find((p) => p.id === data.procedimentoId);
    const novosItens: ItemAtendimento[] = dentes.map((numeroDente) => ({
      id: -(Date.now() + numeroDente),
      procedimentoId: data.procedimentoId as number,
      procedimentoNome: proc?.nome ?? '',
      numeroDente,
      face: (data.face || null) as FaceDente | null,
      situacaoIdentificada: data.situacaoIdentificada as SituacaoDente,
      observacao: data.observacao || null,
    }));
    onAddProcedimento(novosItens);
    reset();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px',
            backgroundColor: '#E1F5EE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AddOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Adicionar procedimento
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          {dentes.length > 0 && (
            <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Dente{dentes.length > 1 ? 's' : ''}: {dentes.join(', ')}
              </Typography>
            </Box>
          )}

          <Controller
            name="procedimentoId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Procedimento *"
                error={!!errors.procedimentoId}
                helperText={errors.procedimentoId?.message}
                fullWidth
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                {procedimentos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="situacaoIdentificada"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Situação identificada *"
                error={!!errors.situacaoIdentificada}
                helperText={errors.situacaoIdentificada?.message}
                fullWidth
              >
                {Object.entries(SITUACAO_DENTE_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="face"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Face"
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                {Object.entries(FACE_DENTE_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="observacao"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Observação"
                multiline
                minRows={2}
                fullWidth
                inputProps={{ maxLength: 500 }}
              />
            )}
          />
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit(onSubmit)}
          disabled={dentes.length === 0}
        >
          Adicionar
        </Button>
      </Box>
    </Drawer>
  );
}
