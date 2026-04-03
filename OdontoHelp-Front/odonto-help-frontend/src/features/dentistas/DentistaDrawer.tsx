// src/features/dentistas/DentistaDrawer.tsx
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse,
} from '@mui/material';
import { Close, PersonOutlined, ExpandMore, ExpandLess, LockOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useDentistaDrawerStore } from './dentistaStore';
import { useCreateDentista, useUpdateDentista } from './useDentistas';
import { maskCpf, maskCro, maskTelefone } from '../../shared/utils/masks';
import { useAuthStore } from '../../shared/store/authStore';
import type { DentistaFormData } from './types';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  telefone: z.string().min(14, 'Telefone incompleto — use (00) 00000-0000'),
  cpf: z.string().min(14, 'CPF incompleto — use 000.000.000-00'),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'], {
    errorMap: () => ({ message: 'Selecione um gênero' }),
  }),
  dataNascimento: z.string().min(1, 'Data de nascimento obrigatória').refine(
    (val) => new Date(val) < new Date(),
    'Data não pode ser futura'
  ),
  cro: z.string().min(4, 'CRO inválido — ex: SP-12345'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').or(z.literal('')),
});

interface Props {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function DentistaDrawer({ onSuccess, onError }: Props) {
  const { open, editingId, draft, hasDraft, clearDraft, updateDraft } = useDentistaDrawerStore();
  const isEditing = editingId !== null;
  const [confirmClose, setConfirmClose] = useState(false);
  const [acessoExpanded, setAcessoExpanded] = useState(false);

  const isAdmin = useAuthStore((s) => s.usuario?.perfil === 'ADMIN');

  const create = useCreateDentista();
  const update = useUpdateDentista(editingId ?? 0);

  const {
    control, handleSubmit, reset, watch,
    formState: { errors, isDirty },
  } = useForm<DentistaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '', email: '', telefone: '', cpf: '',
      genero: 'NAO_INFORMADO', dataNascimento: '', cro: '', senha: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: draft.nome ?? '',
        email: draft.email ?? '',
        telefone: draft.telefone ?? '',
        cpf: draft.cpf ?? '',
        genero: draft.genero ?? 'NAO_INFORMADO',
        dataNascimento: draft.dataNascimento ?? '',
        cro: draft.cro ?? '',
        senha: '',
      });
      // expande automaticamente ao editar se já tem email
      setAcessoExpanded(isEditing && !!draft.email);
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

  const onSubmit = async (data: DentistaFormData) => {
    try {
      if (isEditing) {
        await update.mutateAsync(data);
        onSuccess('Dentista atualizado com sucesso!');
      } else {
        await create.mutateAsync(data);
        onSuccess('Dentista cadastrado com sucesso!');
      }
      clearDraft();
    } catch (e: any) {
      onError(e.message ?? 'Erro ao salvar dentista');
    }
  };

  const loading = create.isPending || update.isPending;

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
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {isEditing ? 'Editar dentista' : 'Novo dentista'}
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

        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>

            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados pessoais</Typography>

            <Controller name="nome" control={control} render={({ field }) => (
              <TextField {...field} label="Nome completo *" error={!!errors.nome}
                helperText={errors.nome?.message} fullWidth inputProps={{ maxLength: 100 }} />
            )} />

            <Stack direction="row" spacing={1.5}>
              <Controller name="cpf" control={control} render={({ field }) => (
                <TextField {...field} label="CPF *" placeholder="000.000.000-00"
                  error={!!errors.cpf} helperText={errors.cpf?.message} fullWidth
                  inputProps={{ maxLength: 14 }}
                  onChange={(e) => field.onChange(maskCpf(e.target.value))} />
              )} />
              <Controller name="dataNascimento" control={control} render={({ field }) => (
                <TextField {...field} label="Nascimento *" type="date"
                  error={!!errors.dataNascimento} helperText={errors.dataNascimento?.message}
                  fullWidth InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }} />
              )} />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Controller name="telefone" control={control} render={({ field }) => (
                <TextField {...field} label="Telefone *" placeholder="(00) 00000-0000"
                  error={!!errors.telefone} helperText={errors.telefone?.message} fullWidth
                  inputProps={{ maxLength: 15 }}
                  onChange={(e) => field.onChange(maskTelefone(e.target.value))} />
              )} />
              <Controller name="genero" control={control} render={({ field }) => (
                <TextField {...field} select label="Gênero *"
                  error={!!errors.genero} helperText={errors.genero?.message} fullWidth>
                  <MenuItem value="NAO_INFORMADO">Não informado</MenuItem>
                  <MenuItem value="MASCULINO">Masculino</MenuItem>
                  <MenuItem value="FEMININO">Feminino</MenuItem>
                  <MenuItem value="OUTRO">Outro</MenuItem>
                </TextField>
              )} />
            </Stack>

            <Divider />
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Dados profissionais</Typography>

            <Controller name="cro" control={control} render={({ field }) => (
              <TextField {...field} label="CRO *" placeholder="SP-12345"
                error={!!errors.cro} helperText={errors.cro?.message ?? 'Formato: UF-NNNNN'}
                fullWidth inputProps={{ maxLength: 8 }}
                onChange={(e) => field.onChange(maskCro(e.target.value))} />
            )} />

            {/* ── Acesso — só para ADMIN ── */}
            {isAdmin && (
              <>
                <Divider />
                <Box
                  onClick={() => setAcessoExpanded((v) => !v)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', userSelect: 'none', py: 0.5,
                    '&:hover': { opacity: 0.75 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockOutlined sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                      Dados de acesso
                    </Typography>
                  </Box>
                  {acessoExpanded
                    ? <ExpandLess sx={{ fontSize: 18, color: 'text.disabled' }} />
                    : <ExpandMore sx={{ fontSize: 18, color: 'text.disabled' }} />
                  }
                </Box>

                <Collapse in={acessoExpanded} unmountOnExit>
                  <Stack spacing={2.5} sx={{ pt: 0.5 }}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <TextField {...field} label="E-mail *" type="email" error={!!errors.email}
                        helperText={errors.email?.message} fullWidth inputProps={{ maxLength: 120 }} />
                    )} />
                    <Controller name="senha" control={control} render={({ field }) => (
                      <TextField {...field}
                        label={isEditing ? 'Nova senha (deixe vazio para manter)' : 'Senha *'}
                        type="password" error={!!errors.senha}
                        helperText={errors.senha?.message ?? (isEditing ? '' : 'Mínimo 6 caracteres')}
                        fullWidth inputProps={{ maxLength: 64 }} />
                    )} />
                  </Stack>
                </Collapse>
              </>
            )}

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
