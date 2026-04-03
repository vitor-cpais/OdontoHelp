// src/features/auth/LoginPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { useLogin } from './useAuth';

// ─── schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});
type FormValues = z.infer<typeof schema>;

// ─── componente ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => login.mutate(values);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo / branding */}
        <Stack alignItems="center" spacing={1} mb={4}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocalHospitalRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            OdontoHelp
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Faça login para continuar
          </Typography>
        </Stack>

        {/* Erro global */}
        {login.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(login.error as any)?.response?.data?.message ??
              'E-mail ou senha inválidos.'}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            size="small"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            size="small"
            {...register('senha')}
            error={!!errors.senha}
            helperText={errors.senha?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                    aria-label="Mostrar/ocultar senha"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={login.isPending}
            sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
          >
            {login.isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'Entrar'
            )}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          textAlign="center"
          mt={3}
        >
          Acesso restrito — usuários criados pelo administrador.
        </Typography>
      </Box>
    </Box>
  );
}
