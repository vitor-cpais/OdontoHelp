import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import { useArquivoBlobUrl } from './useArquivos';

interface Props {
  pacienteId: number;
  arquivoId: number;
  alt?: string;
  sx?: SxProps<Theme>;
}

export default function ArquivoBlobImage({ pacienteId, arquivoId, alt, sx }: Props) {
  const { data: url, isLoading, isError } = useArquivoBlobUrl(pacienteId, arquivoId);

  if (isLoading) {
    return <Skeleton variant="rounded" sx={{ width: '100%', height: '100%', ...sx }} />;
  }
  if (isError || !url) return null;

  return <Box component="img" src={url} alt={alt ?? ''} sx={sx} />;
}
