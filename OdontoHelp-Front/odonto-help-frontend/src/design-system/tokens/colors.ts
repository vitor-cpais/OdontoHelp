export const colors = {
  brand: {
    primary: '#0F6E56',
    primaryLight: '#1D9E75',
    primaryDark: '#085041',
    primaryMuted: '#E1F5EE',
    primaryMutedHover: '#d0eee3',
    onPrimary: '#ffffff',
  },
  neutral: {
    900: '#1a1a18',
    800: '#2C2C2A',
    600: '#5F5E5A',
    500: '#888780',
    300: '#D3D1C7',
    200: '#F1EFE8',
    100: '#F7F6F2',
    0: '#ffffff',
  },
  surface: {
    app: '#F7F6F2',
    paper: '#ffffff',
    subtle: '#F1EFE8',
    border: 'rgba(0,0,0,0.08)',
    borderSubtle: 'rgba(0,0,0,0.07)',
  },
  text: {
    primary: '#1a1a18',
    secondary: '#5F5E5A',
    muted: '#888780',
    disabled: '#B4B2A9',
  },
  feedback: {
    success: '#0F6E56',
    warning: '#BA7517',
    error: '#C0392B',
    info: '#185FA5',
  },
  sidebar: {
    bg: '#ffffff',
    text: '#2C2C2A',
    textMuted: '#888780',
    active: '#0F6E56',
    activeBg: '#E1F5EE',
    border: 'rgba(0,0,0,0.07)',
  },
  status: {
    agenda: {
      agendado: { bg: '#E6F1FB', text: '#185FA5', border: '#B5D4F4' },
      confirmado: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
      atendido: { bg: '#E8F0FE', text: '#1A73E8', border: '#A8C7FA' },
      cancelado: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
      falta: { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
    },
    atendimento: {
      emAndamento: { bg: '#FFF8E1', text: '#B45309', border: '#FCD34D' },
      finalizado: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
    },
    cadastro: {
      ativo: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
      inativo: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
    },
    odontograma: {
      saudavel: '#0F6E56',
      cariado: '#C0392B',
      restaurado: '#185FA5',
      extraido: '#888780',
      implante: '#7B3FA0',
      tratamentoCanal: '#BA7517',
      coroa: '#1D7FA0',
      ausente: '#B4B2A9',
    },
  },
} as const;

export type ColorTokens = typeof colors;
