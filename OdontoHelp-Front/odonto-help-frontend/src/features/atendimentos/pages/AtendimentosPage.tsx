
import {
  Box, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Alert, Skeleton, InputAdornment, Button, Snackbar,
} from '@mui/material';
import { EditOutlined, VisibilityOutlined, SearchOutlined } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import { useAuthStore } from '../../../shared/store/authStore';
import { useAtendimentosPorDentista } from '../useAtendimentos';
import AtendimentoStatusChip from '../AtendimentoStatusChip';
import { STATUS_ATENDIMENTO_LABELS } from '../types';
import type { StatusAtendimento } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import IniciarAtendimentoAvulsoDialog from '../IniciarAtendimentoAvulsoDialog';

type FiltroStatus = 'TODOS' | StatusAtendimento;

function formatDT(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AtendimentosPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const isAdmin = usuario?.perfil === 'ADMIN';

  const today = new Date().toISOString().split('T')[0];
  const [page, setPage] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODOS');
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);
  const [avulsoOpen, setAvulsoOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'error',
  });

  useEffect(() => {
    setDataInicio(today);
    setDataFim(today);
  }, [today]);

  const nomePaciente = useDebounce(busca, 400);

  const dentistaId = isAdmin ? null : (usuario?.dentistaId ?? null);

  const { data, isLoading } = useAtendimentosPorDentista(dentistaId, page, {
    nomePaciente: nomePaciente || undefined,
    status: filtroStatus === 'TODOS' ? undefined : filtroStatus,
    dataInicio: dataInicio ? `${dataInicio}T00:00:00` : undefined,
    dataFim:    dataFim    ? `${dataFim}T23:59:59`    : undefined,
  });

  const atendimentos = data?.content ?? [];
  const paginationCount = buildTablePaginationCount(data, page, 10);

  const resetPage = () => setPage(0);

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
          borderRadius: 4,
          color: '#fff',
          background: 'linear-gradient(135deg, #143B34 0%, #0F6E56 100%)',
          boxShadow: '0 18px 50px rgba(8,80,65,0.18)',
        }}
      >
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Fluxo clínico
        </Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>
          Atendimentos
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>
          Acompanhe atendimentos em andamento, histórico clínico e procedimentos registrados.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', mr: 1 }}>
          Para o fluxo normal, use Agendamentos.
        </Typography>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          onClick={() => setAvulsoOpen(true)}
        >
          Atendimento avulso
        </Button>
      </Box>
      </Paper>

      <IniciarAtendimentoAvulsoDialog
        open={avulsoOpen}
        onClose={() => setAvulsoOpen(false)}
        onError={(msg) => setToast({ open: true, msg, severity: 'error' })}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>


      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                  <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/atendimentos/${a.id}`)}>
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
                        <IconButton size="small" onClick={() => navigate(`/atendimentos/${a.id}`)}>
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
          count={isLoading ? 0 : paginationCount}
          page={page}
          rowsPerPage={10}
          rowsPerPageOptions={[10]}
          onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
          backIconButtonProps={{ disabled: page === 0 || isLoading }}
          nextIconButtonProps={{ disabled: (data?.last ?? true) || isLoading }}
          sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
        />
      </Paper>
    </Box>
  );
}