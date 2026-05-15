// src/features/atendimentos/pages/AtendimentosPage.tsx
//
// IMPORTANTE: Atendimentos NÃO são criados aqui.
// O fluxo correto é: Agendamentos → "Iniciar Atendimento" → Atendimento criado.
// Esta página é apenas visualização/edição de atendimentos já existentes.

import {
  Box, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton,
} from '@mui/material';
import { EditOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAtendimentosPorDentista } from '../useAtendimentos';
import AtendimentoStatusChip from '../AtendimentoStatusChip';
import AtendimentoDrawer from '../AtendimentoDrawer';
import { STATUS_ATENDIMENTO_LABELS } from '../types';
import type { Atendimento, StatusAtendimento } from '../types';

type FiltroStatus = 'TODOS' | StatusAtendimento;

function formatDT(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AtendimentosPage() {
  const usuario = useAuthStore((s) => s.usuario);

  const [page, setPage] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  /**
   * dentistaId: usa o dentista vinculado ao usuário, não o usuário diretamente.
   * O backend /atendimentos/dentista/{dentistaId} espera o ID da entidade Dentista.
   * TODO: buscar dentistaId do perfil do usuário logado (via /dentistas/me ou similar).
   */
  const dentistaId = usuario?.id ?? null;
  const { data, isLoading } = useAtendimentosPorDentista(dentistaId, page);

  const atendimentos = (data?.content ?? []).filter((a) =>
    filtroStatus === 'TODOS' ? true : a.status === filtroStatus
  );

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
      {/* Toolbar — sem botão "Novo Atendimento": criação é feita via Agendamentos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          size="small"
          label="Status"
          value={filtroStatus}
          onChange={(e) => { setFiltroStatus(e.target.value as FiltroStatus); setPage(0); }}
          sx={{ width: 160 }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          {(Object.keys(STATUS_ATENDIMENTO_LABELS) as StatusAtendimento[]).map((s) => (
            <MenuItem key={s} value={s}>{STATUS_ATENDIMENTO_LABELS[s]}</MenuItem>
          ))}
        </TextField>

        <Box sx={{ flex: 1 }} />

        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Para iniciar um novo atendimento, acesse a tela de Agendamentos.
        </Typography>
      </Box>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>#</TableCell>
                <TableCell>Paciente</TableCell>
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : atendimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum atendimento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                atendimentos.map((a) => (
                  <TableRow
                    key={a.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleOpenEditar(a)}
                  >
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>
                        #{a.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {a.pacienteNome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDT(a.horaInicio)}
                      </Typography>
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
                    <TableCell>
                      <AtendimentoStatusChip status={a.status} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={a.status === 'FINALIZADO' ? 'Visualizar' : 'Editar'}>
                        <IconButton size="small" onClick={() => handleOpenEditar(a)}>
                          {a.status === 'FINALIZADO'
                            ? <VisibilityOutlined sx={{ fontSize: 16 }} />
                            : <EditOutlined       sx={{ fontSize: 16 }} />
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
