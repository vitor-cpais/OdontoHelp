// src/features/odontograma/OdontogramaVisual.tsx
/**
 * Odontograma visual com 32 dentes — numeração FDI
 * Arcada superior: 18-11 (direita→centro) + 21-28 (centro→esquerda)
 * Arcada inferior: 48-41 (direita→centro) + 31-38 (centro→esquerda)
 */
import { Box, Typography, Tooltip, Skeleton, Chip } from '@mui/material';
import { useState } from 'react';
import { useOdontograma } from './useOdontograma';
import { SITUACAO_DENTE_COLORS, SITUACAO_DENTE_LABELS } from '../atendimentos/types';
import type { SituacaoDente } from '../atendimentos/types';
import type { OdontogramaMap } from './types';

/* ── Layout FDI ─────────────────────────────────────────────────────────── */
const ARCADA_SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const ARCADA_INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const COR_SAUDAVEL = '#E1F5EE';
const COR_BORDA_SAUDAVEL = '#9FE1CB';
const COR_TEXTO_SAUDAVEL = '#0F6E56';

interface DenteProps {
  numero: number;
  mapa: OdontogramaMap;
  onClick?: (numero: number) => void;
  selected?: boolean;
}

function Dente({ numero, mapa, onClick, selected }: DenteProps) {
  const entry = mapa[numero];
  const situacao = entry?.situacaoAtual as SituacaoDente | undefined;
  const cor = situacao ? SITUACAO_DENTE_COLORS[situacao] : COR_SAUDAVEL;
  const label = situacao ? SITUACAO_DENTE_LABELS[situacao] : 'Saudável';

  // Converte cor hex → rgba com alpha para fundo
  const bgColor = situacao ? `${cor}22` : COR_SAUDAVEL;
  const borderColor = situacao ? cor : COR_BORDA_SAUDAVEL;
  const textColor = situacao ? cor : COR_TEXTO_SAUDAVEL;

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
            Dente {numero}
          </Typography>
          <Typography variant="caption">{label}</Typography>
          {entry?.observacao && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.75)' }}>
              {entry.observacao}
            </Typography>
          )}
        </Box>
      }
      placement="top"
      arrow
    >
      <Box
        onClick={() => onClick?.(numero)}
        sx={{
          width: 36,
          height: 44,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          borderRadius: '8px',
          border: '1.5px solid',
          borderColor: selected ? 'primary.main' : borderColor,
          backgroundColor: selected ? '#E1F5EE' : bgColor,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          outline: selected ? '2px solid' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: '1px',
          '&:hover': onClick
            ? {
                borderColor: 'primary.main',
                backgroundColor: '#E1F5EE',
                transform: 'scale(1.08)',
                zIndex: 1,
              }
            : {},
        }}
      >
        {/* Círculo de situação */}
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: situacao ? cor : 'transparent',
            border: '1.5px solid',
            borderColor: borderColor,
            flexShrink: 0,
          }}
        />
        {/* Número FDI */}
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 600,
            color: textColor,
            lineHeight: 1,
            fontFamily: 'monospace',
          }}
        >
          {numero}
        </Typography>
      </Box>
    </Tooltip>
  );
}

/* ── Legenda ──────────────────────────────────────────────────────────────── */
const SITUACOES_LEGENDA: SituacaoDente[] = [
  'SAUDAVEL', 'CARIADO', 'RESTAURADO', 'EXTRAIDO',
  'IMPLANTE', 'TRATAMENTO_CANAL', 'COROA', 'AUSENTE',
];

function Legenda() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
      {SITUACOES_LEGENDA.map((s) => (
        <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: s === 'SAUDAVEL' ? 'transparent' : SITUACAO_DENTE_COLORS[s],
              border: '1.5px solid',
              borderColor: s === 'SAUDAVEL' ? COR_BORDA_SAUDAVEL : SITUACAO_DENTE_COLORS[s],
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            {SITUACAO_DENTE_LABELS[s]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ── Componente principal ─────────────────────────────────────────────────── */
interface OdontogramaVisualProps {
  pacienteId: number;
  selectedDente?: number | null;
  onDenteClick?: (numero: number) => void;
}

export default function OdontogramaVisual({
  pacienteId,
  selectedDente,
  onDenteClick,
}: OdontogramaVisualProps) {
  const { data: mapa, isLoading } = useOdontograma(pacienteId);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const odontogramaMap = mapa ?? {};

  return (
    <Box>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          overflowX: 'auto',
        }}
      >
        {/* Arcada superior */}
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
            Arcada superior
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            {ARCADA_SUPERIOR.map((n) => (
              <Dente
                key={n}
                numero={n}
                mapa={odontogramaMap}
                onClick={onDenteClick}
                selected={selectedDente === n}
              />
            ))}
          </Box>
        </Box>

        {/* Divisor central */}
        <Box sx={{ borderTop: '1.5px dashed', borderColor: 'divider', my: 1.5, mx: 1 }} />

        {/* Arcada inferior */}
        <Box>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            {ARCADA_INFERIOR.map((n) => (
              <Dente
                key={n}
                numero={n}
                mapa={odontogramaMap}
                onClick={onDenteClick}
                selected={selectedDente === n}
              />
            ))}
          </Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
            Arcada inferior
          </Typography>
        </Box>
      </Box>

      <Legenda />
    </Box>
  );
}
