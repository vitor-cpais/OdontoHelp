import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { authService } from './authService';
import { getApiErrorMessage } from '../../shared/lib/axios';

const schema = z.object({
  novaSenha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme a senha'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  path: ['confirmarSenha'],
  message: 'As senhas nao conferem',
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const token = useMemo(() => params.get('token') ?? '', [params]);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.resetPassword({ token, novaSenha: values.novaSenha }),
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Box component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))} sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 3, p: { xs: 3, sm: 4 }, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <Stack alignItems="center" spacing={1} mb={4}>
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospitalRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Nova senha</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Crie uma nova senha para acessar o OdontoHelp.
          </Typography>
        </Stack>

        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Link invalido. Solicite uma nova redefinicao de senha.
          </Alert>
        )}

        {mutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Senha redefinida com sucesso. Voce ja pode entrar.
          </Alert>
        )}

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(mutation.error, 'Nao foi possivel redefinir a senha.')}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Nova senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            fullWidth
            size="small"
            disabled={!token || mutation.isSuccess}
            {...register('novaSenha')}
            error={!!errors.novaSenha}
            helperText={errors.novaSenha?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" aria-label="Mostrar/ocultar senha">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            fullWidth
            size="small"
            disabled={!token || mutation.isSuccess}
            {...register('confirmarSenha')}
            error={!!errors.confirmarSenha}
            helperText={errors.confirmarSenha?.message}
          />

          <Button type="submit" variant="contained" fullWidth size="large" disabled={!token || mutation.isPending || mutation.isSuccess} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Redefinir senha
          </Button>

          <Link component={RouterLink} to="/login" textAlign="center" underline="hover">
            Ir para o login
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}
