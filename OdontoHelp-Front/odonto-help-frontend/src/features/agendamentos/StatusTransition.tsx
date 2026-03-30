import { Box, Button, Stack, Typography, Stepper, Step, StepLabel, Chip } from '@mui/material';
import { CheckCircleOutlined, CancelOutlined, ErrorOutlined } from '@mui/icons-material';
import { STATUS_COLORS, STATUS_LABELS } from './types';
import type { StatusConsulta } from './types';

interface Props {
  statusAtual: StatusConsulta;
  onStatusChange: (status: StatusConsulta) => void;
  loading?: boolean;
}

// Transições válidas por status
const TRANSICOES: Record<StatusConsulta, StatusConsulta[]> = {
  AGENDADO:   ['CONFIRMADO'],
  CONFIRMADO: ['CONCLUIDO', 'FALTA'],
  CANCELADO:  [],
  CONCLUIDO:  [],
  FALTA:      [],
};

// Fluxo principal (stepper)
const FLUXO_PRINCIPAL: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO', 'CONCLUIDO'];

const STATUS_ICONS: Partial<Record<StatusConsulta, React.ReactNode>> = {
  CANCELADO: <CancelOutlined sx={{ fontSize: 16 }} />,
  FALTA: <ErrorOutlined sx={{ fontSize: 16 }} />,
  CONCLUIDO: <CheckCircleOutlined sx={{ fontSize: 16 }} />,
};

const isFinal = (s: StatusConsulta) => ['CANCELADO', 'CONCLUIDO', 'FALTA'].includes(s);

export default function StatusTransition({ statusAtual, onStatusChange, loading }: Props) {
  const transicoes = TRANSICOES[statusAtual];
  const stepAtual = FLUXO_PRINCIPAL.indexOf(
    statusAtual === 'FALTA' || statusAtual === 'CANCELADO' ? 'CONFIRMADO' : statusAtual
  );

  return (
    <Stack spacing={2}>

      {/* Stepper do fluxo principal */}
      <Stepper activeStep={stepAtual} alternativeLabel>
        {FLUXO_PRINCIPAL.map((s) => {
          const colors = STATUS_COLORS[s];
          const isAtual = s === statusAtual;
          return (
            <Step key={s} completed={FLUXO_PRINCIPAL.indexOf(s) < stepAtual}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active': { color: colors.text },
                    '&.Mui-completed': { color: '#0F6E56' },
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isAtual ? 600 : 400,
                    color: isAtual ? colors.text : 'text.disabled',
                    fontSize: '0.72rem',
                  }}
                >
                  {STATUS_LABELS[s]}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Status atual */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.disabled">Status atual:</Typography>
        <Chip
          label={STATUS_LABELS[statusAtual]}
          size="small"
          sx={{
            fontWeight: 500,
            fontSize: '0.72rem',
            height: 22,
            borderRadius: '6px',
            backgroundColor: STATUS_COLORS[statusAtual].bg,
            color: STATUS_COLORS[statusAtual].text,
            border: '1px solid',
            borderColor: STATUS_COLORS[statusAtual].border,
          }}
        />
      </Box>

      {/* Botões de transição válidos */}
      {isFinal(statusAtual) ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Este agendamento está encerrado e não pode ser alterado.
        </Typography>
      ) : (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.disabled">Avançar para:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {transicoes.map((s) => {
              const colors = STATUS_COLORS[s];
              const icon = STATUS_ICONS[s];
              const isDestructive = s === 'CANCELADO';
              return (
                <Button
                  key={s}
                  size="small"
                  variant="outlined"
                  startIcon={icon}
                  onClick={() => onStatusChange(s)}
                  disabled={loading}
                  sx={{
                    fontSize: '0.78rem',
                    py: 0.5,
                    px: 1.5,
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.bg,
                    '&:hover': {
                      backgroundColor: colors.border,
                      borderColor: colors.text,
                    },
                  }}
                >
                  {STATUS_LABELS[s]}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
