// src/features/agendamentos/StatusTransition.tsx
import { Box, Button, Stack, Typography, Stepper, Step, StepLabel, Chip } from '@mui/material';
import { CheckCircleOutlined, CancelOutlined, ErrorOutlined, MedicalServicesOutlined } from '@mui/icons-material';
import { STATUS_COLORS, STATUS_LABELS } from './types';
import type { StatusConsulta } from './types';

interface Props {
  statusAtual: StatusConsulta;
  onStatusChange: (status: StatusConsulta) => void;
  onIniciarAtendimento?: () => void;  // ← ação explícita separada
  loading?: boolean;
}

/**
 * Máquina de estados do Agendamento.
 *
 * ATENDIDO NÃO é uma transição manual — é definida automaticamente pelo backend
 * ao chamar POST /agendamentos/{id}/iniciar-atendimento.
 *
 * CONCLUIDO foi removido: o agendamento vai para ATENDIDO (backend faz isso)
 * e o atendimento tem seu próprio ciclo EM_ANDAMENTO → FINALIZADO.
 */
const TRANSICOES: Partial<Record<StatusConsulta, StatusConsulta[]>> = {
  AGENDADO:   ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['CANCELADO', 'FALTA'],
  ATENDIDO:   [],    // somente leitura — controlado pelo ciclo do Atendimento
  CANCELADO:  [],
  FALTA:      [],
};

const FLUXO_PRINCIPAL: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO', 'ATENDIDO'];

const STATUS_ICONS: Partial<Record<StatusConsulta, React.ReactNode>> = {
  CANCELADO: <CancelOutlined sx={{ fontSize: 16 }} />,
  FALTA:     <ErrorOutlined  sx={{ fontSize: 16 }} />,
  ATENDIDO:  <MedicalServicesOutlined sx={{ fontSize: 16 }} />,
};

const isFinal = (s: StatusConsulta) =>
  ['ATENDIDO', 'CANCELADO', 'FALTA'].includes(s);

const podeIniciarAtendimento = (s: StatusConsulta) =>
  s === 'AGENDADO' || s === 'CONFIRMADO';

export default function StatusTransition({
  statusAtual,
  onStatusChange,
  onIniciarAtendimento,
  loading,
}: Props) {
  const transicoes   = TRANSICOES[statusAtual] ?? [];
  const stepAtual    = FLUXO_PRINCIPAL.indexOf(statusAtual);
  const stepVisual   = stepAtual === -1 ? 1 : stepAtual; // CANCELADO/FALTA ficam no passo 1 visualmente

  return (
    <Stack spacing={2}>

      {/* Stepper do fluxo principal */}
      <Stepper activeStep={stepVisual} alternativeLabel>
        {FLUXO_PRINCIPAL.map((s) => {
          const colors = STATUS_COLORS[s];
          const isAtual = s === statusAtual;
          return (
            <Step key={s} completed={FLUXO_PRINCIPAL.indexOf(s) < stepVisual}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active':    { color: colors.text },
                    '&.Mui-completed': { color: '#0F6E56'   },
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

      {/* Ação: Iniciar Atendimento — só aparece se aplicável */}
      {podeIniciarAtendimento(statusAtual) && onIniciarAtendimento && (
        <Button
          variant="contained"
          size="small"
          startIcon={<MedicalServicesOutlined sx={{ fontSize: 16 }} />}
          onClick={onIniciarAtendimento}
          disabled={loading}
          sx={{ alignSelf: 'flex-start', fontSize: '0.78rem' }}
        >
          Iniciar atendimento clínico
        </Button>
      )}

      {/* Transições manuais de status */}
      {isFinal(statusAtual) ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          {statusAtual === 'ATENDIDO'
            ? 'Atendimento clínico em andamento. Finalize-o pela tela de Atendimentos.'
            : 'Este agendamento está encerrado e não pode ser alterado.'}
        </Typography>
      ) : transicoes.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.disabled">Alterar status:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {transicoes.map((s) => {
              const colors = STATUS_COLORS[s];
              return (
                <Button
                  key={s}
                  size="small"
                  variant="outlined"
                  startIcon={STATUS_ICONS[s]}
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
      ) : null}
    </Stack>
  );
}
