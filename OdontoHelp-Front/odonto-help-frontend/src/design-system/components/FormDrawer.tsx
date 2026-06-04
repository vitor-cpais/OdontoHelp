import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface FormDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  width?: number;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export default function FormDrawer({
  open,
  title,
  subtitle,
  width = 420,
  children,
  actions,
  onClose,
}: FormDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: width }, maxWidth: '100%' } }}
    >
      <Stack sx={{ height: '100%' }}>
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
          {children}
        </Box>

        {actions && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2 }}>
              {actions}
            </Box>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
