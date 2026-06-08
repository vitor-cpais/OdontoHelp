import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { authService } from './authService';
import { getApiErrorMessage } from '../../shared/lib/axios';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => authService.forgotPassword(payload),
    onSuccess: () => setSuccess(true),
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Box component="form" onSubmit={handleSubmit((values) => mutation.mutate({ email: values.email.trim().toLowerCase() }))} sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 3, p: { xs: 3, sm: 4 }, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <Stack alignItems="center" spacing={1} mb={4}>
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospitalRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Recuperar senha</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Informe seu e-mail para receber o link de redefinicao.
          </Typography>
        </Stack>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Se o e-mail existir, enviaremos um link de redefinicao em instantes.
          </Alert>
        )}

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(mutation.error, 'Nao foi possivel solicitar a redefinicao.')}
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

          <Button type="submit" variant="contained" fullWidth size="large" disabled={mutation.isPending} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Enviar link
          </Button>

          <Link component={RouterLink} to="/login" textAlign="center" underline="hover">
            Voltar para o login
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}
