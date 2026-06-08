
import {
  Box, Button, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment, Badge, Chip,
} from '@mui/material';
import {
  AddOutlined, EditOutlined, ToggleOnOutlined,
  ToggleOffOutlined, SearchOutlined,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import { useProcedimentos, useToggleAtivoProcedimento } from '../useProcedimentos';
import { useProcedimentoDrawerStore } from '../procedimentoStore';
import StatusChip from '../../../shared/components/StatusChip';
import ProcedimentoDrawer from '../ProcedimentoDrawer';
import type { Procedimento } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';

type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';

function formatValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDuracao(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function ProcedimentosPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODOS');
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const nomeBusca = useDebounce(busca, 400);
  const { openNew, openEdit, hasDraft } = useProcedimentoDrawerStore();
  const toggleAtivo = useToggleAtivoProcedimento();

  const params = {
    page,
    size: rowsPerPage,
    nome: nomeBusca || undefined,
    isAtivo: statusFiltro === 'TODOS' ? undefined : statusFiltro === 'ATIVO',
  };

  const { data, isLoading } = useProcedimentos(params);
  
  const procedimentos = data?.content ?? [];
  
  const paginationCount = buildTablePaginationCount(data, page, rowsPerPage);

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const handleToggleAtivo = async (p: Procedimento) => {
    try {
      await toggleAtivo.mutateAsync({ id: p.id, isAtivo: !p.isAtivo });
      showToast(`Procedimento ${!p.isAtivo ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch {
      showToast('Erro ao alterar status', 'error');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #253B35 0%, #0F6E56 100%)', boxShadow: '0 18px 50px rgba(8,80,65,0.18)' }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>Catálogo clínico</Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>Procedimentos</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>Padronize preços, duração e legenda visual da operação clínica.</Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
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

        <TextField
          select
          size="small"
          value={statusFiltro}
          onChange={(e) => { setStatusFiltro(e.target.value as StatusFiltro); setPage(0); }}
          sx={{ width: 140 }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          <MenuItem value="ATIVO">Ativos</MenuItem>
          <MenuItem value="INATIVO">Inativos</MenuItem>
        </TextField>

        <Box sx={{ flex: 1 }} />

        <Badge
          color="warning"
          variant="dot"
          invisible={!hasDraft}
          sx={{ '& .MuiBadge-dot': { width: 8, height: 8, borderRadius: '50%' } }}
        >
          <Button
            variant="contained"
            startIcon={<AddOutlined sx={{ fontSize: 17 }} />}
            onClick={openNew}
            size="small"
            sx={{ height: 36, px: 2 }}
          >
            Novo procedimento
          </Button>
        </Badge>
      </Box>
      </Paper>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Nome</TableCell>
                <TableCell>Valor de referência</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell>Cor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : procedimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum procedimento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                procedimentos.map((p) => (
                  <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => openEdit(p)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {p.nome}
                      </Typography>
                      {p.descricao && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.descricao}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatValor(p.valorBase)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDuracao(p.duracaoMinutos)}</Typography>
                    </TableCell>
                    <TableCell>
                      {p.corLegenda ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16, height: 16, borderRadius: '4px',
                              backgroundColor: p.corLegenda,
                              border: '1px solid rgba(0,0,0,0.1)',
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            {p.corLegenda}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip isAtivo={p.isAtivo} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(p)}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={p.isAtivo ? 'Desativar' : 'Ativar'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleAtivo(p)}
                          sx={{ color: p.isAtivo ? 'error.main' : 'success.main' }}
                        >
                          {p.isAtivo
                            ? <ToggleOffOutlined sx={{ fontSize: 16 }} />
                            : <ToggleOnOutlined sx={{ fontSize: 16 }} />
                          }
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={isLoading ? 0 : paginationCount}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
          onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
  
          backIconButtonProps={{ disabled: page === 0 || isLoading }}
          nextIconButtonProps={{ disabled: (data?.last ?? true) || isLoading }}
          sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
        />
      </Paper>

      <ProcedimentoDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}