import { createTheme } from '@mui/material/styles';

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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F6E56',
      light: '#1D9E75',
      dark: '#085041',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5F5E5A',
      light: '#888780',
      dark: '#444441',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7F6F2',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a18',
      secondary: '#5F5E5A',
      disabled: '#B4B2A9',
    },
    divider: 'rgba(0,0,0,0.08)',
    error: { main: '#C0392B' },
    warning: { main: '#BA7517' },
    success: { main: '#0F6E56' },
    sidebar: {
      bg: '#ffffff',
      text: '#2C2C2A',
      textMuted: '#888780',
      active: '#0F6E56',
      activeBg: '#E1F5EE',
      border: 'rgba(0,0,0,0.07)',
    },
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
    body2: { fontSize: '0.8rem', lineHeight: 1.5, color: '#5F5E5A' },
    caption: { fontSize: '0.75rem', color: '#888780' },
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
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { background: #F7F6F2; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D3D1C7; border-radius: 8px; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '7px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(15,110,86,0.25)' },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.15)',
          '&:hover': { borderColor: '#0F6E56', backgroundColor: '#E1F5EE' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#0F6E56', borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            '&.Mui-focused': { color: '#0F6E56' },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem', backgroundColor: '#ffffff' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '0.5px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
        head: { fontWeight: 500, fontSize: '0.78rem', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.05em' },
        body: { fontSize: '0.875rem', borderColor: 'rgba(0,0,0,0.06)' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: '#F7F6F2' } },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(0,0,0,0.07)' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6 },
      },
    },
  },
});

export default theme;
