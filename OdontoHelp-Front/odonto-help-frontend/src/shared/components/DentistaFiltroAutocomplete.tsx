import { Autocomplete, TextField } from '@mui/material';
import type { Dentista } from '../../features/dentistas/types';

interface Props {
  dentistas: Dentista[];
  value: Dentista | null;
  onChange: (dentistaId: number | '') => void;
  width?: number | string | { xs?: string; sm?: number };
  label?: string;
}

export default function DentistaFiltroAutocomplete({
  dentistas,
  value,
  onChange,
  width = { xs: '100%', sm: 260 },
  label = 'Dentista',
}: Props) {
  return (
    <Autocomplete
      size="small"
      options={dentistas}
      value={value}
      onChange={(_, selected) => onChange(selected?.id ?? '')}
      getOptionLabel={(option) => option.nome}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      sx={{ width }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Todos os dentistas" />
      )}
    />
  );
}
