// src/features/odontograma/HistoricoOdontogramaTab.tsx
import {
  Box, Typography, Skeleton, Button, Chip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination,
} from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useHistoricoOdontograma, useHistoricoPorDente } from './useOdontograma';
import { SITUACAO_DENTE_COLORS, SITUACAO_DENTE_LABELS } from '../atendimentos/types';
import type { SituacaoDente } from '../atendimentos/types';

function SituacaoTag({ situacao }: { situacao: SituacaoDente | null }) {
  if (!situacao) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const cor = SITUACAO_DENTE_COLORS[situacao];
  return (
    <Chip
      label={SITUACAO_DENTE_LABELS[situacao]}
      size="small"
      sx={{
        fontSize: '0.68rem',
        height: 20,
        borderRadius: '5px',
        backgroundColor: `${cor}22`,
        color: cor,
        border: `1px solid ${cor}55`,
        fontWeight: 500,
      }}
    />
  );
}

function formatDT(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  pacienteId: number;
  /** Se passado, filtra pelo dente selecionado no odontograma visual */
  denteFiltro?: number | null;
  onClearFiltro?: () => void;
}

export default function HistoricoOdontogramaTab({ pacienteId, denteFiltro, onClearFiltro }: Props) {
  const [page, setPage] = useState(0);

  const queryGeral = useHistoricoOdontograma(denteFiltro ? null : pacienteId, page);
  const queryDente = useHistoricoPorDente(denteFiltro ? pacienteId : null, denteFiltro ?? null, page);

  const query = denteFiltro ? queryDente : queryGeral;
  const registros = query.data?.content ?? [];

  return (
    <Box>
      {/* Filtro ativo */}
      {denteFiltro && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Filtrando por dente:
          </Typography>
          <Chip
            label={`Dente ${denteFiltro}`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={onClearFiltro}
          />
        </Box>
      )}

      {query.isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={48} />
          ))}
        </Box>
      ) : registros.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            {denteFiltro
              ? `Nenhum registro para o dente ${denteFiltro}`
              : 'Nenhum histórico encontrado'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            O histórico é gerado automaticamente ao finalizar um atendimento.
          </Typography>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell>Dente</TableCell>
                  <TableCell>Situação anterior</TableCell>
                  <TableCell></TableCell>
                  <TableCell>Situação nova</TableCell>
                  <TableCell>Dentista</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Atendimento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registros.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {r.numeroDente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <SituacaoTag situacao={r.situacaoAnterior} />
                    </TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      <ArrowForwardOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </TableCell>
                    <TableCell>
                      <SituacaoTag situacao={r.situacaoNova} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.dentistaNome}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDT(r.registradoEm)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
                        #{r.atendimentoId}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={-1}
            page={page}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            onPageChange={(_, p) => setPage(p)}
            labelDisplayedRows={({ from, to }) => `${from}–${to}`}
            nextIconButtonProps={{ disabled: query.data?.last ?? true }}
            sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
          />
        </Paper>
      )}
    </Box>
  );
}
