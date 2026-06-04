import { Box, InputAdornment, Stack, TextField } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface SearchToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
}

export default function SearchToolbar({
  searchValue,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  filters,
  actions,
}: SearchToolbarProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
      {onSearchChange && (
        <TextField
          placeholder={searchPlaceholder}
          value={searchValue ?? ''}
          onChange={(event) => onSearchChange(event.target.value)}
          size="small"
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}

      {filters}

      <Box sx={{ flex: 1 }} />

      {actions}
    </Stack>
  );
}
