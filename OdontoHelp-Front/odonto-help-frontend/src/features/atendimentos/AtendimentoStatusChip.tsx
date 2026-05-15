// src/features/atendimentos/AtendimentoStatusChip.tsx
import { Chip } from '@mui/material';
import { STATUS_ATENDIMENTO_COLORS, STATUS_ATENDIMENTO_LABELS } from './types';
import type { StatusAtendimento } from './types';

interface Props {
  status: StatusAtendimento;
  size?: 'small' | 'medium';
}

export default function AtendimentoStatusChip({ status, size = 'small' }: Props) {
  const colors = STATUS_ATENDIMENTO_COLORS[status];
  return (
    <Chip
      label={STATUS_ATENDIMENTO_LABELS[status]}
      size={size}
      sx={{
        fontWeight: 500,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: '6px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: '1px solid',
        borderColor: colors.border,
      }}
    />
  );
}
