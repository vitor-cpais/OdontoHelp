import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  DashboardOutlined,
  HealingOutlined,
  LocalHospitalOutlined,
  PeopleOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../shared/store/authStore';
import { useOnboardingStore } from '../../shared/store/onboardingStore';
import { authService } from '../auth/authService';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { getOnboardingSteps } from './onboardingContent';

const STEP_ICONS = [
  LocalHospitalOutlined,
  DashboardOutlined,
  CalendarMonthOutlined,
  PeopleOutlined,
  HealingOutlined,
  PersonOutlined,
  LocalHospitalOutlined,
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingDialog({ open, onClose }: Props) {
  const usuario = useAuthStore((s) => s.usuario);
  const patchUsuario = useAuthStore((s) => s.patchUsuario);
  const closeStore = useOnboardingStore((s) => s.close);
  const steps = getOnboardingSteps(usuario?.perfil);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError(null);
    }
  }, [open]);

  const isLast = activeStep >= steps.length - 1;
  const StepIcon = STEP_ICONS[activeStep] ?? LocalHospitalOutlined;
  const step = steps[activeStep];

  const concluir = async () => {
    if (!usuario?.id) return;
    setSaving(true);
    setError(null);
    try {
      await authService.concluirOnboarding();
      patchUsuario({ onboardingConcluido: true });
      closeStore();
      onClose();
      setActiveStep(0);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    closeStore();
    onClose();
    setActiveStep(0);
  };

  const handleNext = () => {
    if (isLast) {
      void concluir();
      return;
    }
    setActiveStep((s) => s + 1);
  };

  return (
    <Dialog
      open={open}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="overline" color="primary">
          Primeiros passos
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {usuario?.nome ? `Olá, ${usuario.nome.split(' ')[0]}!` : 'Bem-vindo ao OdontoHelp'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} alignItems="center" sx={{ py: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StepIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {step.description}
            </Typography>
          </Box>
        </Stack>

        {error && (
          <Typography variant="body2" color="error" textAlign="center" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <MobileStepper
          variant="dots"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          sx={{ mt: 2, bgcolor: 'transparent', justifyContent: 'center' }}
          nextButton={<span />}
          backButton={<span />}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button color="inherit" onClick={() => void concluir()} disabled={saving}>
          Pular
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            disabled={activeStep === 0 || saving}
            onClick={() => setActiveStep((s) => s - 1)}
          >
            Anterior
          </Button>
          <Button variant="contained" onClick={handleNext} disabled={saving}>
            {saving ? 'Salvando...' : isLast ? 'Terminar' : 'Próximo'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
