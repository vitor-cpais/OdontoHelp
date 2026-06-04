import { StatusChip } from '../../design-system/components';
import { STATUS_COLORS, STATUS_LABELS } from '../../domains/agendamentos';
import type { StatusConsulta } from '../../domains/agendamentos';

interface Props {
  status: StatusConsulta;
  size?: 'small' | 'medium';
}

export default function AgendamentoStatusChip({ status, size = 'small' }: Props) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status] ?? status;
  return (
    <StatusChip
      label={label}
      size={size}
      statusColor={colors}
      tone="neutral"
    />
  );
}
