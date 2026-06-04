import { StatusChip as BaseStatusChip } from '../../design-system/components';

interface Props {
  isAtivo: boolean;
  size?: 'small' | 'medium';
}

export default function DentistaStatusChip({ isAtivo, size = 'small' }: Props) {
  return (
    <BaseStatusChip
      label={isAtivo ? 'Ativo' : 'Inativo'}
      size={size}
      tone={isAtivo ? 'success' : 'error'}
    />
  );
}
