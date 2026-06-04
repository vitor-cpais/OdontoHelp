// src/features/usuarios/UsuarioDrawer.tsx
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, MenuItem, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse, Alert,
} from '@mui/material';
import {
  Close, ManageAccountsOutlined,
  ExpandMore, ExpandLess, LockOutlined,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useUsuarioDrawerStore } from './usuarioStore';
import { useAlterarPerfilUsuario, useCreateUsuario, useUpdateUsuario } from './useUsuarios';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { maskCpf, maskTelefone, maskData, formatDataToISO, formatDataFromISO, isValidBirthDate } from '../../shared/utils/masks';
import type { UsuarioFormData } from './types';
import { useAuthStore } from '../../shared/store/authStore';

const baseSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  cpf: z.string().min(14, 'CPF incompleto — use 000.000.000-00'),
  telefone: z.string().min(14, 'Telefone incompleto — use (00) 00000-0000'),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'], {
    errorMap: () => ({ message: 'Selecione um gênero' }),
  }),
  dataNascimento: z.string()
    .min(10, 'Data de nascimento obrigatória')
    .refine(
      (val: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      'Use o formato DD/MM/YYYY'
    )
    .refine(
      (val: string) => isValidBirthDate(val),
      'Data deve estar entre 1900 e hoje'
    ),
  perfil: z.enum(['ADMIN', 'DENTISTA', 'RECEPCAO'], {
    errorMap: () => ({ message: 'Selecione um perfil' }),
  }),
});

const createSchema = baseSchema.extend({
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const editSchema = baseSchema.extend({
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').or(z.literal('')),
});

interface Props {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function UsuarioDrawer({ onSuccess, onError }: Props) {
  const { open, editingId, draft, hasDraft, clearDraft, updateDraft } = useUsuarioDrawerStore();
  const isEditing = editingId !== null;
  const usuarioLogado = useAuthStore((s) => s.usuario);
  const [confirmClose, setConfirmClose] = useState(false);
  const [senhaExpanded, setSenhaExpanded] = useState(false);

  const create = useCreateUsuario();
  const update = useUpdateUsuario(editingId ?? 0);
  const alterarPerfil = useAlterarPerfilUsuario();

  const schema = useMemo(() => (isEditing ? editSchema : createSchema), [isEditing]);
  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const {
    control, handleSubmit, reset, watch,
    formState: { errors, isDirty },
  } = useForm<UsuarioFormData>({
    resolver,
    defaultValues: {
      nome: '', email: '', cpf: '', telefone: '',
      genero: 'NAO_INFORMADO', dataNascimento: '',
      perfil: 'RECEPCAO', senha: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: draft.nome ?? '',
        email: draft.email ?? '',
        cpf: draft.cpf ?? '',
        telefone: draft.telefone ?? '',
        genero: draft.genero ?? 'NAO_INFORMADO',
        dataNascimento: draft.dataNascimento ? formatDataFromISO(draft.dataNascimento) : '',
        perfil: (draft.perfil as any) ?? 'RECEPCAO',
        senha: '',
      });
      setSenhaExpanded(false);
    }
  }, [open, reset]);

  const values = watch();
  useEffect(() => {
    if (open) updateDraft(values);
  }, [JSON.stringify(values), open]);

  const perfilClinico = draft.perfil === 'DENTISTA' || draft.perfil === 'PACIENTE';
  const canAlterarPerfil = isEditing
    && usuarioLogado?.perfil === 'ADMIN'
    && usuarioLogado.id !== editingId
    && !perfilClinico;
  const perfilDisabled = isEditing && !canAlterarPerfil;
  const perfilHelperText = usuarioLogado?.id === editingId
    ? 'Você não pode alterar o próprio perfil'
    : perfilClinico
      ? 'Perfis clínicos são gerenciados em módulos específicos'
      : errors.perfil?.message;

  const handleClose = () => {
    if (isDirty && !isEditing) setConfirmClose(true);
    else clearDraft();
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const dataToSend = {
        ...data,
        dataNascimento: formatDataToISO(data.dataNascimento),
      };
      if (isEditing) {
        await update.mutateAsync(dataToSend as UsuarioFormData);
        if (canAlterarPerfil && data.perfil !== draft.perfil) {
          await alterarPerfil.mutateAsync({ id: editingId, perfil: data.perfil });
        }
        onSuccess('Usuário atualizado com sucesso!');
      } else {
        await create.mutateAsync(dataToSend as UsuarioFormData);
        onSuccess('Usuário cadastrado com sucesso!');
      }
      clearDraft();
    } catch (e: any) {
      onError(getApiErrorMessage(e, 'Erro ao salvar usuário'));
    }
  };

  const loading = create.isPending || update.isPending || alterarPerfil.isPending;

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
              backgroundColor: '#F1EFE8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ManageAccountsOutlined sx={{ fontSize: 17, color: '#5F5E5A' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                {isEditing ? 'Editar usuário' : 'Novo usuário'}
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
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          <Stack spacing={2.5}>

            {/* ── Dados pessoais ── */}
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
                  onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => field.onChange(maskCpf(e.target.value))} />
              )} />
                <Controller name="dataNascimento" control={control} render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nascimento *"
                    placeholder="DD/MM/YYYY"
                    fullWidth
                    error={!!errors.dataNascimento}
                    helperText={errors.dataNascimento?.message}
                    inputProps={{ maxLength: 10 }}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                      field.onChange(maskData(e.target.value));
                    }}
                    value={field.value ?? ''}
                  />
                )} />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Controller name="telefone" control={control} render={({ field }) => (
                <TextField {...field} label="Telefone *" placeholder="(00) 00000-0000"
                  error={!!errors.telefone} helperText={errors.telefone?.message} fullWidth
                  inputProps={{ maxLength: 15 }}
                  onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => field.onChange(maskTelefone(e.target.value))} />
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

            {/* ── Acesso ── */}
            <Divider />
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>Acesso</Typography>

            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} label="E-mail *" type="email"
                error={!!errors.email} helperText={errors.email?.message}
                fullWidth inputProps={{ maxLength: 120 }} />
            )} />

            <Controller name="perfil" control={control} render={({ field }) => (
              <TextField {...field} select label="Perfil *"
                disabled={perfilDisabled}
                error={!!errors.perfil} helperText={perfilHelperText} fullWidth>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="RECEPCAO">Recepção</MenuItem>
                {(field.value === 'DENTISTA' || field.value === 'PACIENTE') && (
                  <MenuItem value={field.value} disabled>
                    {field.value === 'DENTISTA' ? 'Dentista' : 'Paciente'}
                  </MenuItem>
                )}
              </TextField>
            )} />

            {/* Senha ao criar — direto */}
            {!isEditing && (
              <Controller name="senha" control={control} render={({ field }) => (
                <TextField {...field} label="Senha *" type="password"
                  error={!!errors.senha}
                  helperText={errors.senha?.message ?? 'Mínimo 6 caracteres'}
                  fullWidth inputProps={{ maxLength: 64 }} />
              )} />
            )}

            {/* Redefinir senha ao editar — colapsável */}
            {isEditing && (
              <>
                <Box
                  onClick={() => setSenhaExpanded((v: boolean) => !v)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer', userSelect: 'none', py: 0.5,
                    '&:hover': { opacity: 0.75 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockOutlined sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                      Redefinir senha
                    </Typography>
                  </Box>
                  {senhaExpanded
                    ? <ExpandLess sx={{ fontSize: 18, color: 'text.disabled' }} />
                    : <ExpandMore sx={{ fontSize: 18, color: 'text.disabled' }} />
                  }
                </Box>

                <Collapse in={senhaExpanded} unmountOnExit>
                  <Stack spacing={1.5}>
                    <Alert severity="info" sx={{ fontSize: '0.78rem', py: 0.5 }}>
                      Deixe vazio para manter a senha atual.
                    </Alert>
                    <Controller name="senha" control={control} render={({ field }) => (
                      <TextField {...field} label="Nova senha" type="password"
                        error={!!errors.senha}
                        helperText={errors.senha?.message ?? 'Mínimo 6 caracteres'}
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

        {/* Footer */}
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
