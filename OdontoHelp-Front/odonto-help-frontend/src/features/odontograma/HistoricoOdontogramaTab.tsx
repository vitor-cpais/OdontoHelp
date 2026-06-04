import {
  Alert, Box, Typography, Skeleton, Chip, Button,
  FormControl, InputLabel, MenuItem, Select, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination,
} from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import {
  useHistoricoOdontograma,
  useHistoricoPorDente,
  useOdontogramaVersao,
  useOdontogramaVersoes,
} from './useOdontograma';
import OdontogramaVisual from './OdontogramaVisual';
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
        fontSize: '0.68rem', height: 20, borderRadius: '5px',
        backgroundColor: `${cor}22`, color: cor,
        border: `1px solid ${cor}55`, fontWeight: 500,
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
  denteFiltro?: number | null;
  onClearFiltro?: () => void;
  onCriarPlano?: () => void;
}

export default function HistoricoOdontogramaTab({ pacienteId, denteFiltro, onClearFiltro, onCriarPlano }: Props) {
  const [page, setPage] = useState(0);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  useEffect(() => { setPage(0); }, [denteFiltro]);

  const queryGeral = useHistoricoOdontograma(denteFiltro ? null : pacienteId, page);
  const queryDente = useHistoricoPorDente(denteFiltro ? pacienteId : null, denteFiltro ?? null, page);
  const versoesQuery = useOdontogramaVersoes(pacienteId, 0, 50);
  const versaoQuery = useOdontogramaVersao(pacienteId, selectedVersionId);
  const query = denteFiltro ? queryDente : queryGeral;

  const registros = query.data?.content ?? [];
  const versoes = versoesQuery.data?.content ?? [];
  const selectedVersion = versoes.find((v) => v.id === selectedVersionId);
  const isBlocked = query.isLoading || query.isFetching;

  const paginationCount = query.data
    ? (query.data.last
        ? (page * 20) + query.data.numberOfElements
        : (page * 20) + query.data.numberOfElements + 20)
    : 0;

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Versões do odontograma</Typography>
              <Typography variant="caption" color="text.secondary">
                Veja como o odontograma estava em cada snapshot gerado por atendimento ou edição direta.
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 320 } }}>
              <InputLabel>Versão</InputLabel>
              <Select
                label="Versão"
                value={selectedVersionId ? String(selectedVersionId) : ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedVersionId(value ? Number(value) : null);
                }}
                disabled={versoesQuery.isLoading || versoes.length === 0}
              >
                <MenuItem value="">Selecione uma versão</MenuItem>
                {versoes.map((versao) => (
                  <MenuItem key={versao.id} value={String(versao.id)}>
                    {`v${versao.versao} - ${formatDT(versao.criadoEm)}${versao.atendimentoId ? ` - Atendimento #${versao.atendimentoId}` : ''}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {versoesQuery.isLoading ? (
            <Skeleton variant="rounded" height={48} />
          ) : versoes.length === 0 ? (
            <Alert severity="info">Nenhuma versão do odontograma encontrada.</Alert>
          ) : selectedVersion ? (
            <Box>
              <Alert severity={selectedVersion.inicial ? 'info' : 'success'} sx={{ mb: 1.5 }}>
                {selectedVersion.inicial
                  ? 'Versão inicial do odontograma.'
                  : `${selectedVersion.totalDentesAlterados} dente${selectedVersion.totalDentesAlterados === 1 ? '' : 's'} alterado${selectedVersion.totalDentesAlterados === 1 ? '' : 's'} por ${selectedVersion.editadoPorNome}.`}
              </Alert>
              {versaoQuery.isLoading ? (
                <Skeleton variant="rounded" height={180} />
              ) : (
                <OdontogramaVisual
                  pacienteId={pacienteId}
                  mapaOverride={versaoQuery.data ?? {}}
                />
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Selecione uma versão para visualizar o odontograma daquele momento.
            </Typography>
          )}

          {versoesQuery.data && !versoesQuery.data.last && (
            <Typography variant="caption" color="text.secondary">
              Mostrando as 50 versões mais recentes.
            </Typography>
          )}
        </Stack>
      </Paper>

      {denteFiltro && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">Filtrando por dente:</Typography>
            <Chip
              label={`Dente ${denteFiltro}`}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={onClearFiltro}
            />
          </Box>
          {onCriarPlano && (
            <Button size="small" variant="outlined" onClick={onCriarPlano}>
              Criar plano para dente {denteFiltro}
            </Button>
          )}
        </Box>
      )}

      {query.isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" height={48} />)}
        </Box>
      ) : registros.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            {denteFiltro ? `Nenhum registro para o dente ${denteFiltro}` : 'Nenhum histórico encontrado'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            O histórico é gerado automaticamente ao salvar procedimentos do atendimento ou ao atualizar um dente direto.
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
                    <TableCell><SituacaoTag situacao={r.situacaoAnterior} /></TableCell>
                    <TableCell sx={{ px: 0.5 }}>
                      <ArrowForwardOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </TableCell>
                    <TableCell><SituacaoTag situacao={r.situacaoNova} /></TableCell>
                    <TableCell><Typography variant="body2">{r.dentistaNome}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{formatDT(r.registradoEm)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
                        {r.atendimentoId != null ? `#${r.atendimentoId}` : 'Direto'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={paginationCount}
            page={page}
            rowsPerPage={20}
            rowsPerPageOptions={[20]}
            onPageChange={(_, p) => setPage(Math.max(0, p))}
            labelDisplayedRows={({ from, to }) => `${from}–${to}`}
            backIconButtonProps={{ disabled: isBlocked || page === 0 }}
            nextIconButtonProps={{ disabled: isBlocked || (query.data?.last ?? true) }}
            sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
          />
        </Paper>
      )}
    </Box>
  );
}
