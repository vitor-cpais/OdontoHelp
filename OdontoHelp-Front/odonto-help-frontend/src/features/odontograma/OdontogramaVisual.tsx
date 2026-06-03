import { Box, Typography, Tooltip, Skeleton } from '@mui/material';
import { useState } from 'react';
import { useOdontograma } from './useOdontograma';
import { SITUACAO_DENTE_COLORS, SITUACAO_DENTE_LABELS } from '../atendimentos/types';
import type { SituacaoDente } from '../atendimentos/types';
import type { OdontogramaMap } from './types';

const ARCADA_SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const ARCADA_INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const SITUACOES_LEGENDA: SituacaoDente[] = [
  'SAUDAVEL', 'CARIADO', 'RESTAURADO', 'EXTRAIDO',
  'IMPLANTE', 'TRATAMENTO_CANAL', 'COROA', 'AUSENTE',
];

const COR_SAUDAVEL       = '#E1F5EE';
const COR_BORDA_SAUDAVEL = '#9FE1CB';
const COR_TEXTO_SAUDAVEL = '#0F6E56';

interface DenteProps {
  numero: number;
  mapa: OdontogramaMap;
  onClick?: (numero: number) => void;
  selected?: boolean;
  temPlanoPendente?: boolean;
  filtroAtivo: SituacaoDente | null;
}

function Dente({ numero, mapa, onClick, selected, temPlanoPendente, filtroAtivo }: DenteProps) {
  const entry = mapa[numero];
  const situacao = entry?.situacaoAtual as SituacaoDente | undefined;

  const isSemMarca  = !situacao || situacao === 'SAUDAVEL';
  const cor         = isSemMarca ? COR_SAUDAVEL : SITUACAO_DENTE_COLORS[situacao!];
  const label       = isSemMarca ? 'Saudável'   : SITUACAO_DENTE_LABELS[situacao!];
  const bgColor     = isSemMarca ? COR_SAUDAVEL  : `${cor}22`;
  const borderColor = isSemMarca ? COR_BORDA_SAUDAVEL : cor;
  const textColor   = isSemMarca ? COR_TEXTO_SAUDAVEL  : cor;

  // Filtro: se há um filtro ativo e este dente não bate, fica apagado
  const situacaoParaFiltro = isSemMarca ? 'SAUDAVEL' : situacao!;
  const filtrado = filtroAtivo !== null && situacaoParaFiltro !== filtroAtivo;

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
            Dente {numero}{temPlanoPendente ? ' • Plano pendente' : ''}
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
        onClick={() => !filtrado && onClick?.(numero)}
        onKeyDown={(e) => {
          if (!onClick || filtrado) return;
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(numero); }
        }}
        role={onClick && !filtrado ? 'button' : undefined}
        tabIndex={onClick && !filtrado ? 0 : undefined}
        aria-pressed={!!selected}
        aria-label={`Dente ${numero} - ${label}`}
        sx={{
          width: 36, height: 44,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 0.25,
          borderRadius: '8px',
          border: '1.5px solid',
          borderColor: selected ? 'primary.main' : borderColor,
          backgroundColor: selected ? '#E1F5EE' : bgColor,
          cursor: onClick && !filtrado ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          opacity: filtrado ? 0.2 : 1,
          outline: selected
            ? '2px solid'
            : temPlanoPendente && !filtrado
              ? '2px dashed #F59E0B'
              : 'none',
          outlineColor: selected ? 'primary.main' : undefined,
          outlineOffset: '2px',
          '&:hover': onClick && !filtrado ? {
            borderColor: 'primary.main',
            backgroundColor: '#E1F5EE',
            transform: 'scale(1.08)',
            zIndex: 1,
          } : {},
        }}
      >
        <Box sx={{
          width: 18, height: 18, borderRadius: '50%',
          backgroundColor: isSemMarca ? 'transparent' : cor,
          border: '1.5px solid',
          borderColor: borderColor,
          flexShrink: 0,
        }} />
        <Typography sx={{
          fontSize: '0.6rem', fontWeight: 600, color: textColor,
          lineHeight: 1, fontFamily: 'monospace',
        }}>
          {numero}
        </Typography>
      </Box>
    </Tooltip>
  );
}

interface LegendaProps {
  filtro: SituacaoDente | null;
  onFiltro: (s: SituacaoDente | null) => void;
  dentesPendentesPlano?: number[];
}

function Legenda({ filtro, onFiltro, dentesPendentesPlano = [] }: LegendaProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
      {SITUACOES_LEGENDA.map((s) => {
        const ativo = filtro === s;
        const cor = s === 'SAUDAVEL' ? COR_BORDA_SAUDAVEL : SITUACAO_DENTE_COLORS[s];
        return (
          <Box
            key={s}
            role="button"
            tabIndex={0}
            onClick={() => onFiltro(ativo ? null : s)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFiltro(ativo ? null : s); }}
            aria-pressed={ativo}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.4, borderRadius: '20px', cursor: 'pointer',
              border: '1px solid',
              borderColor: ativo ? cor : 'transparent',
              backgroundColor: ativo ? `${cor}22` : 'transparent',
              transition: 'all 0.15s ease',
              '&:hover': { backgroundColor: `${cor}18`, borderColor: `${cor}88` },
            }}
          >
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              backgroundColor: s === 'SAUDAVEL' ? 'transparent' : cor,
              border: '1.5px solid', borderColor: cor,
            }} />
            <Typography variant="caption" sx={{
              color: ativo ? cor : 'text.secondary',
              fontSize: '0.68rem', fontWeight: ativo ? 600 : 400,
              transition: 'color 0.15s',
            }}>
              {SITUACAO_DENTE_LABELS[s]}
            </Typography>
          </Box>
        );
      })}
      {dentesPendentesPlano.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.4 }}>
          <Box sx={{
            width: 10, height: 10, borderRadius: '2px',
            border: '1.5px dashed #F59E0B',
          }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
            Plano pendente
          </Typography>
        </Box>
      )}
    </Box>
  );
}

interface OdontogramaVisualProps {
  pacienteId: number;
  selectedDentes?: number[];
  onDenteClick?: (numero: number) => void;
  mapaOverride?: OdontogramaMap;
  dentesPendentesPlano?: number[];
}

export default function OdontogramaVisual({
  pacienteId,
  selectedDentes,
  onDenteClick,
  mapaOverride,
  dentesPendentesPlano = [],
}: OdontogramaVisualProps) {
  const { data: mapa, isLoading } = useOdontograma(pacienteId);
  const [filtro, setFiltro] = useState<SituacaoDente | null>(null);

  if (isLoading) {
    return <Box><Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} /></Box>;
  }

  const odontogramaMap = mapaOverride ?? mapa ?? {};

  return (
    <Box>
      <Box sx={{
        p: 2.5, borderRadius: 2, border: '1px solid',
        borderColor: 'divider', backgroundColor: 'background.paper', overflowX: 'auto',
      }}>
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
            Arcada superior
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            {ARCADA_SUPERIOR.map((n) => (
              <Dente
                key={n} numero={n} mapa={odontogramaMap}
                onClick={onDenteClick}
                selected={selectedDentes?.includes(n)}
                temPlanoPendente={dentesPendentesPlano.includes(n)}
                filtroAtivo={filtro}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ borderTop: '1.5px dashed', borderColor: 'divider', my: 1.5, mx: 1 }} />
        <Box>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            {ARCADA_INFERIOR.map((n) => (
              <Dente
                key={n} numero={n} mapa={odontogramaMap}
                onClick={onDenteClick}
                selected={selectedDentes?.includes(n)}
                temPlanoPendente={dentesPendentesPlano.includes(n)}
                filtroAtivo={filtro}
              />
            ))}
          </Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
            Arcada inferior
          </Typography>
        </Box>
      </Box>
      <Legenda
        filtro={filtro}
        onFiltro={setFiltro}
        dentesPendentesPlano={dentesPendentesPlano}
      />
    </Box>
  );
}
