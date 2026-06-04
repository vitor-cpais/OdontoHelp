// src/features/atendimentos/AtendimentoStatusChip.tsx
import { StatusChip } from '../../design-system/components';
import { STATUS_ATENDIMENTO_COLORS, STATUS_ATENDIMENTO_LABELS } from './types';
import type { StatusAtendimento } from './types';

interface Props {
  status: StatusAtendimento;
  size?: 'small' | 'medium';
}

export default function AtendimentoStatusChip({ status, size = 'small' }: Props) {
  const colors = STATUS_ATENDIMENTO_COLORS[status];
  return (
    <StatusChip
      label={STATUS_ATENDIMENTO_LABELS[status]}
      size={size}
      statusColor={colors}
    />
  );
}
