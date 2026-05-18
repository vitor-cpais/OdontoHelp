// src/features/atendimentos/pages/AtendimentosPage.tsx
import {
  Box, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment,
} from '@mui/material';
import { EditOutlined, VisibilityOutlined, SearchOutlined } from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAtendimentosPorDentista } from '../useAtendimentos';
import AtendimentoStatusChip from '../AtendimentoStatusChip';
import AtendimentoDrawer from '../AtendimentoDrawer';
import { STATUS_ATENDIMENTO_LABELS } from '../types';
import type { Atendimento, StatusAtendimento } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';

type FiltroStatus = 'TODOS' | StatusAtendimento;

function formatDT(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AtendimentosPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const isAdmin = usuario?.perfil === 'ADMIN';

  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const nomePaciente = useDebounce(busca, 400);


  const dentistaId = isAdmin ? null : (usuario?.dentistaId ?? null);

  const { data, isLoading } = useAtendimentosPorDentista(dentistaId, page, {
    nomePaciente: nomePaciente || undefined,
    status: filtroStatus === 'TODOS' ? undefined : filtroStatus,
    dataInicio: dataInicio ? `${dataInicio}T00:00:00` : undefined,
    dataFim:    dataFim    ? `${dataFim}T23:59:59`    : undefined,
  });

  const atendimentos = data?.content ?? [];

  const resetPage = () => setPage(0);

  const handleOpenEditar = (a: Atendimento) => {
    setAtendimentoSelecionado(a);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setAtendimentoSelecionado(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Busca por nome do paciente */}
        <TextField
          placeholder="Buscar paciente..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); resetPage(); }}
          size="small"
          sx={{ width: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro de status */}
        <TextField
          select
          size="small"
          label="Status"
          value={filtroStatus}
          onChange={(e) => { setFiltroStatus(e.target.value as FiltroStatus); resetPage(); }}
          sx={{ width: 160 }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          {(Object.keys(STATUS_ATENDIMENTO_LABELS) as StatusAtendimento[]).map((s) => (
            <MenuItem key={s} value={s}>{STATUS_ATENDIMENTO_LABELS[s]}</MenuItem>
          ))}
        </TextField>

        {/* Filtro de período */}
        <TextField
          label="De"
          type="date"
          size="small"
          value={dataInicio}
          onChange={(e) => { setDataInicio(e.target.value); resetPage(); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
        <TextField
          label="Até"
          type="date"
          size="small"
          value={dataFim}
          onChange={(e) => { setDataFim(e.target.value); resetPage(); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />

        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Para iniciar um atendimento, acesse Agendamentos.
        </Typography>
      </Box>

      {/* Aviso se DENTISTA sem dentistaId no store (sessão antiga, precisa re-logar) */}
      {!isAdmin && dentistaId === null && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Sessão desatualizada — faça logout e login novamente para carregar seus atendimentos.
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>#</TableCell>
                <TableCell>Paciente</TableCell>
                {isAdmin && <TableCell>Dentista</TableCell>}
                <TableCell>Início</TableCell>
                <TableCell>Procedimentos</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: isAdmin ? 7 : 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : atendimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum atendimento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                atendimentos.map((a) => (
                  <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenEditar(a)}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
                        #{a.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{a.pacienteNome}</Typography>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{a.dentistaNome}</Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{formatDT(a.horaInicio)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {a.itens.length} procedimento{a.itens.length !== 1 ? 's' : ''}
                      </Typography>
                      {a.itens.length > 0 && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {a.itens.map((i) => i.procedimentoNome).join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><AtendimentoStatusChip status={a.status} /></TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={a.status === 'FINALIZADO' ? 'Visualizar' : 'Editar'}>
                        <IconButton size="small" onClick={() => handleOpenEditar(a)}>
                          {a.status === 'FINALIZADO'
                            ? <VisibilityOutlined sx={{ fontSize: 16 }} />
                            : <EditOutlined       sx={{ fontSize: 16 }} />}
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
          count={-1}
          page={page}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
          onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
          nextIconButtonProps={{ disabled: data?.last ?? true }}
          sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
        />
      </Paper>

      {atendimentoSelecionado && (
        <AtendimentoDrawer
          open={drawerOpen}
          atendimento={atendimentoSelecionado}
          onClose={handleClose}
          onSuccess={(msg) => showToast(msg, 'success')}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

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
