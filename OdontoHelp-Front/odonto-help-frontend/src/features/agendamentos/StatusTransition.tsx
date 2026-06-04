// src/features/agendamentos/StatusTransition.tsx
import { Box, Stack, Typography, Stepper, Step, StepLabel, Chip } from '@mui/material';
import { STATUS_COLORS, STATUS_LABELS } from '../../domains/agendamentos';
import type { StatusConsulta } from '../../domains/agendamentos';

interface Props {
  statusAtual: StatusConsulta;
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
const FLUXO_PRINCIPAL: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO', 'ATENDIDO'];

const isFinal = (s: StatusConsulta) =>
  ['ATENDIDO', 'CANCELADO', 'FALTA'].includes(s);

export default function StatusTransition({ statusAtual }: Props) {
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

      {isFinal(statusAtual) && (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          {statusAtual === 'ATENDIDO'
            ? 'Atendimento clínico em andamento. Finalize-o pela tela de Atendimentos.'
            : 'Este agendamento está encerrado e não pode ser alterado.'}
        </Typography>
      )}
    </Stack>
  );
}
