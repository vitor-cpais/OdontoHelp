import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { colors } from '../tokens';
import type { ThemeMode } from '../../shared/store/uiPreferencesStore';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: {
      bg: string;
      text: string;
      textMuted: string;
      active: string;
      activeBg: string;
      border: string;
    };
  }
  interface PaletteOptions {
    sidebar?: {
      bg: string;
      text: string;
      textMuted: string;
      active: string;
      activeBg: string;
      border: string;
    };
  }
}

export function createOdontoTheme(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
  palette: {
    mode,
    primary: {
      main: colors.brand.primary,
      light: colors.brand.primaryLight,
      dark: colors.brand.primaryDark,
      contrastText: colors.brand.onPrimary,
    },
    secondary: {
      main: colors.neutral[600],
      light: colors.neutral[500],
      dark: '#444441',
      contrastText: colors.brand.onPrimary,
    },
    background: {
      default: isDark ? '#071411' : colors.surface.app,
      paper: isDark ? '#0D1E1A' : colors.surface.paper,
    },
    text: {
      primary: isDark ? '#F4F7F5' : colors.text.primary,
      secondary: isDark ? '#B6C5BF' : colors.text.secondary,
      disabled: isDark ? '#6F827A' : colors.text.disabled,
    },
    divider: isDark ? 'rgba(255,255,255,0.08)' : colors.surface.border,
    error: { main: colors.feedback.error },
    warning: { main: colors.feedback.warning },
    success: { main: colors.feedback.success },
    sidebar: colors.sidebar,
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.375rem', fontWeight: 500, letterSpacing: '-0.015em' },
    h3: { fontSize: '1.125rem', fontWeight: 500, letterSpacing: '-0.01em' },
    h4: { fontSize: '1rem', fontWeight: 500 },
    h5: { fontSize: '0.9rem', fontWeight: 500 },
    h6: { fontSize: '0.85rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8rem', lineHeight: 1.5, color: isDark ? '#B6C5BF' : colors.text.secondary },
    caption: { fontSize: '0.75rem', color: isDark ? '#8EA099' : colors.text.muted },
    overline: { fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' },
    button: { fontWeight: 500, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.1)',
    ...Array(20).fill('none'),
  ] as Shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { background: ${isDark ? '#071411' : colors.surface.app}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${colors.neutral[300]}; border-radius: 8px; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '7px 16px',
          fontSize: '0.875rem',
          fontWeight: 700,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(15,110,86,0.25)' },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.15)',
          '&:hover': { borderColor: colors.brand.primary, backgroundColor: colors.brand.primaryMuted },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: isDark ? '#10241F' : colors.surface.paper,
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
            '&.Mui-focused fieldset': { borderColor: colors.brand.primary, borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            '&.Mui-focused': { color: colors.brand.primary },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem', backgroundColor: isDark ? '#10241F' : colors.surface.paper },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,110,86,0.08)',
          boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.24)' : '0 14px 34px rgba(22,43,35,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,110,86,0.08)',
          boxShadow: isDark ? '0 12px 34px rgba(0,0,0,0.24)' : '0 12px 34px rgba(22,43,35,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontSize: '0.75rem', fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 800, fontSize: '0.72rem', color: isDark ? '#B6C5BF' : colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: isDark ? '#10241F' : '#F1EFE8' },
        body: { fontSize: '0.875rem', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': { backgroundColor: isDark ? '#10241F' : colors.surface.app },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 24px 70px rgba(22,43,35,0.22)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.surface.borderSubtle },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6 },
      },
    },
  },
  });
}

const theme = createOdontoTheme();
export default theme;
