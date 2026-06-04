import { Chip } from '@mui/material';
import type { ChipProps, SxProps, Theme } from '@mui/material';
import { colors } from '../tokens';

export type StatusTone = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';

export interface StatusChipColor {
  bg: string;
  text: string;
  border: string;
}

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  label: string;
  tone?: StatusTone;
  statusColor?: StatusChipColor;
}

const toneColors: Record<StatusTone, StatusChipColor> = {
  success: colors.status.cadastro.ativo,
  error: colors.status.cadastro.inativo,
  warning: { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
  info: colors.status.agenda.agendado,
  neutral: { bg: colors.surface.subtle, text: colors.text.secondary, border: colors.neutral[300] },
  primary: colors.status.agenda.confirmado,
};

const baseSx: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: '0.72rem',
  height: 22,
  borderRadius: '6px',
  border: '1px solid',
};

export default function StatusChip({
  label,
  tone = 'neutral',
  statusColor,
  size = 'small',
  sx,
  ...props
}: StatusChipProps) {
  const semanticColor = statusColor ?? toneColors[tone];
  const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Chip
      label={label}
      size={size}
      sx={[
        baseSx,
        {
          backgroundColor: semanticColor.bg,
          color: semanticColor.text,
          borderColor: semanticColor.border,
        },
        ...sxList,
      ]}
      {...props}
    />
  );
}
