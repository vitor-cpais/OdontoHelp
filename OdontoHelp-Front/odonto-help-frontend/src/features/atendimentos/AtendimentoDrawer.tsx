// src/features/atendimentos/AtendimentoDrawer.tsx
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Alert,
} from '@mui/material';
import {
  Close, MedicalServicesOutlined, AddOutlined,
  DeleteOutlined, CheckCircleOutlined,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useUpdateAtendimento, useFinalizarAtendimento } from './useAtendimentos';
import { useProcedimentosAtivos } from '../procedimentos/useProcedimentos';
import { SITUACAO_DENTE_LABELS, FACE_DENTE_LABELS } from './types';
import type {
  Atendimento, AtendimentoUpdateData,
  ItemAtendimentoFormData, FaceDente, SituacaoDente,
} from './types';
import AtendimentoStatusChip from './AtendimentoStatusChip';

/* ── Validação FDI 11-48 ─────────────────────────────────────────────────── */
const DENTES_VALIDOS = new Set([
  11,12,13,14,15,16,17,18,
  21,22,23,24,25,26,27,28,
  31,32,33,34,35,36,37,38,
  41,42,43,44,45,46,47,48,
]);

/*
 * O schema Zod é usado APENAS para validação em runtime (zodResolver).
 * O tipo do formulário vem das interfaces do types.ts para evitar o conflito
 * entre `string` (inferido pelo Zod) e os union literals `FaceDente | ''` /
 * `SituacaoDente | ''` definidos nas interfaces.
 */
const itemSchema = z.object({
  procedimentoId: z.union([z.number().positive(), z.literal('')])
    .refine((v) => v !== '', { message: 'Procedimento obrigatório' }),
  numeroDente: z.union([z.number(), z.literal('')])
    .refine((v) => v !== '' && DENTES_VALIDOS.has(Number(v)), { message: 'Dente inválido (FDI 11-48)' }),
  face: z.string().optional().default(''),
  situacaoIdentificada: z.string().min(1, 'Situação obrigatória'),
  observacao: z.string().optional().default(''),
});

const schema = z.object({
  horaInicio: z.string().min(1, 'Hora de início obrigatória'),
  observacoesGerais: z.string().optional().default(''),
  itens: z.array(itemSchema),
});

/* Tipo do formulário vem das interfaces — NÃO de z.infer<typeof schema> */
type FormData = {
  horaInicio: string;
  observacoesGerais: string;
  itens: ItemAtendimentoFormData[];
};

const ITEM_VAZIO: ItemAtendimentoFormData = {
  procedimentoId: '',
  numeroDente: '',
  face: '',
  situacaoIdentificada: '',
  observacao: '',
};

interface Props {
  open: boolean;
  atendimento: Atendimento;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function AtendimentoDrawer({
  open, atendimento, onClose, onSuccess, onError,
}: Props) {
  const isFinalizado = atendimento.status === 'FINALIZADO';
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);

  const { data: procedimentosData } = useProcedimentosAtivos();
  const procedimentos = procedimentosData?.content ?? [];

  const update = useUpdateAtendimento(atendimento.id);
  const finalizar = useFinalizarAtendimento();

  const {
    control, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      horaInicio: '',
      observacoesGerais: '',
      itens: [ITEM_VAZIO],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });

  useEffect(() => {
    if (!open) return;
    reset({
      horaInicio: atendimento.horaInicio?.slice(0, 16) ?? '',
      observacoesGerais: atendimento.observacoesGerais ?? '',
      itens: atendimento.itens.length > 0
        ? atendimento.itens.map((item) => ({
            procedimentoId: item.procedimentoId,
            numeroDente: item.numeroDente,
            face: (item.face ?? '') as FaceDente | '',
            situacaoIdentificada: item.situacaoIdentificada as SituacaoDente,
            observacao: item.observacao ?? '',
          }))
        : [ITEM_VAZIO],
    });
  }, [open, atendimento]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload: AtendimentoUpdateData = {
        horaInicio: data.horaInicio,
        observacoesGerais: data.observacoesGerais,
        itens: data.itens,
      };
      await update.mutateAsync(payload);
      onSuccess('Atendimento atualizado com sucesso!');
      onClose();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao salvar atendimento');
    }
  };

  const handleFinalizar = async () => {
    setConfirmFinalizar(false);
    try {
      await finalizar.mutateAsync(atendimento.id);
      onSuccess('Atendimento finalizado! Odontograma atualizado.');
      onClose();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao finalizar atendimento');
    }
  };

  const loading = update.isPending;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 600 }, display: 'flex', flexDirection: 'column' },
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
              <MedicalServicesOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                  Atendimento #{atendimento.id}
                </Typography>
                <AtendimentoStatusChip status={atendimento.status} />
              </Box>
              <Typography variant="caption" color="text.disabled">
                {atendimento.pacienteNome} · {atendimento.dentistaNome}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

        {isFinalizado && (
          <Alert severity="info" sx={{ mx: 3, mt: 2, borderRadius: 2 }}>
            Atendimento finalizado — apenas leitura. O odontograma foi atualizado automaticamente.
          </Alert>
        )}

        {/* Form */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}
        >
          <Stack spacing={2.5}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados gerais</Typography>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="ID do agendamento"
                value={atendimento.agendamentoId}
                fullWidth
                disabled
                helperText="Vinculado ao criar o atendimento"
              />

              <Controller name="horaInicio" control={control} render={({ field }) => (
                <TextField
                  {...field}
                  label="Hora de início *"
                  type="datetime-local"
                  error={!!errors.horaInicio}
                  helperText={errors.horaInicio?.message}
                  fullWidth
                  disabled={isFinalizado}
                  InputLabelProps={{ shrink: true }}
                />
              )} />
            </Stack>

            <Controller name="observacoesGerais" control={control} render={({ field }) => (
              <TextField
                {...field}
                label="Observações gerais"
                multiline
                minRows={2}
                fullWidth
                disabled={isFinalizado}
                inputProps={{ maxLength: 1000 }}
              />
            )} />

            <Divider />

            {/* Itens */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                Procedimentos realizados ({fields.length})
              </Typography>
              {!isFinalizado && (
                <Button
                  size="small"
                  startIcon={<AddOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => append(ITEM_VAZIO)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Adicionar
                </Button>
              )}
            </Box>

            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: 2, borderRadius: 2,
                  border: '1px solid', borderColor: 'divider',
                  backgroundColor: 'background.default',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Item {index + 1}
                  </Typography>
                  {!isFinalizado && fields.length > 1 && (
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
                          disabled={isFinalizado}
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
                          disabled={isFinalizado}
                          inputProps={{ min: 11, max: 48 }}
                          onChange={(e) => f.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      )}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <Controller
                      name={`itens.${index}.situacaoIdentificada`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          select
                          label="Situação identificada *"
                          error={!!errors.itens?.[index]?.situacaoIdentificada}
                          helperText={errors.itens?.[index]?.situacaoIdentificada?.message}
                          fullWidth
                          disabled={isFinalizado}
                        >
                          {Object.entries(SITUACAO_DENTE_LABELS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />

                    <Controller
                      name={`itens.${index}.face`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          select
                          label="Face"
                          fullWidth
                          disabled={isFinalizado}
                        >
                          <MenuItem value="">—</MenuItem>
                          {Object.entries(FACE_DENTE_LABELS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v}</MenuItem>
                          ))}
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
                        disabled={isFinalizado}
                        inputProps={{ maxLength: 500 }}
                      />
                    )}
                  />
                </Stack>
              </Box>
            ))}

            {fields.length === 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
                Nenhum procedimento adicionado
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>Fechar</Button>

          {!isFinalizado && (
            <>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                onClick={() => setConfirmFinalizar(true)}
                disabled={finalizar.isPending || loading}
              >
                Finalizar atendimento
              </Button>

              <Button variant="contained" disabled={loading} onClick={handleSubmit(onSubmit)}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Confirma finalização */}
      <Dialog open={confirmFinalizar} onClose={() => setConfirmFinalizar(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 500 }}>
          Finalizar atendimento?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Ao finalizar, o odontograma do paciente será atualizado automaticamente com os
            procedimentos registrados. Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmFinalizar(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleFinalizar}
            disabled={finalizar.isPending}
          >
            {finalizar.isPending ? 'Finalizando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
