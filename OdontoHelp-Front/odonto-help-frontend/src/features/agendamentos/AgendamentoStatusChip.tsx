import { Chip } from '@mui/material';
import { STATUS_COLORS, STATUS_LABELS } from './types';
import type { StatusConsulta } from './types';

interface Props {
  status: StatusConsulta;
  size?: 'small' | 'medium';
}

export default function AgendamentoStatusChip({ status, size = 'small' }: Props) {
  const colors = STATUS_COLORS[status];
  return (
    <Chip
      label={STATUS_LABELS[status]}
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
