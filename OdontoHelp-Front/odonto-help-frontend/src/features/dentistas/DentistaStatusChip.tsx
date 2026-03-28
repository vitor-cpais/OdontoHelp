import { Chip } from '@mui/material';

interface Props {
  isAtivo: boolean;
  size?: 'small' | 'medium';
}

export default function DentistaStatusChip({ isAtivo, size = 'small' }: Props) {
  return (
    <Chip
      label={isAtivo ? 'Ativo' : 'Inativo'}
      size={size}
      sx={{
        fontWeight: 500,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: '6px',
        backgroundColor: isAtivo ? '#E1F5EE' : '#FCEBEB',
        color: isAtivo ? '#0F6E56' : '#A32D2D',
        border: '1px solid',
        borderColor: isAtivo ? '#9FE1CB' : '#F7C1C1',
      }}
    />
  );
}
