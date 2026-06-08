import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { maskCpf, maskTelefone, ocultarCpf, ocultarTelefone } from '../utils/masks';

const AUTO_OCULTAR_MS = 30_000;

type Tipo = 'cpf' | 'telefone';

interface Props {
  valor: string;
  tipo: Tipo;
  variant?: 'inline' | 'textfield';
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

function formatarCompleto(valor: string, tipo: Tipo): string {
  return tipo === 'cpf' ? maskCpf(valor) : maskTelefone(valor);
}

function formatarOculto(valor: string, tipo: Tipo): string {
  if (valor.includes('*')) return valor;
  return tipo === 'cpf' ? ocultarCpf(valor) : ocultarTelefone(valor);
}

export default function DadoSensivel({
  valor, tipo, variant = 'inline', label, size = 'medium', fullWidth,
}: Props) {
  const [revelado, setRevelado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limparTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const ocultar = () => {
    limparTimer();
    setRevelado(false);
  };

  const alternar = () => {
    if (revelado) {
      ocultar();
      return;
    }
    setRevelado(true);
    limparTimer();
    timerRef.current = setTimeout(() => setRevelado(false), AUTO_OCULTAR_MS);
  };

  useEffect(() => () => limparTimer(), []);

  const exibicao = revelado ? formatarCompleto(valor, tipo) : formatarOculto(valor, tipo);
  const toggleBtn = (
    <IconButton
      size="small"
      onClick={alternar}
      aria-label={revelado ? 'Ocultar dado' : 'Revelar dado'}
      sx={{ ml: variant === 'inline' ? 0.5 : 0 }}
    >
      {revelado
        ? <VisibilityOffOutlined sx={{ fontSize: 16 }} />
        : <VisibilityOutlined sx={{ fontSize: 16 }} />}
    </IconButton>
  );

  if (variant === 'textfield') {
    return (
      <TextField
        label={label}
        value={exibicao}
        disabled
        fullWidth={fullWidth}
        size={size}
        InputProps={{
          endAdornment: <InputAdornment position="end">{toggleBtn}</InputAdornment>,
        }}
      />
    );
  }

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Typography component="span" variant="inherit">{exibicao}</Typography>
      {toggleBtn}
    </Box>
  );
}
