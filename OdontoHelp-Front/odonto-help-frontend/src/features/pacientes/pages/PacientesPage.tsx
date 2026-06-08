import {
  Box, Button, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment, Badge,
} from '@mui/material';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import {
  AddOutlined, EditOutlined, ToggleOnOutlined, ToggleOffOutlined, SearchOutlined, InfoOutlined,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePacientes, useToggleAtivoPaciente } from '../usePacientes';
import { usePacienteDrawerStore } from '../pacienteStore';
import StatusChip from '../../../shared/components/StatusChip';
import PacienteDrawer from '../PacienteDrawer';
import PacienteDetalheModal from '../PacienteDetalheModal';
import type { Paciente } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import DadoSensivel from '../../../shared/components/DadoSensivel';

type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';

export default function PacientesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODOS');
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const nomeBusca = useDebounce(busca, 400);
  const { openNew, openEdit, hasDraft } = usePacienteDrawerStore();
  const toggleAtivo = useToggleAtivoPaciente();

  const params = {
    page,
    size: rowsPerPage,
    nome: nomeBusca || undefined,
    isAtivo: statusFiltro === 'TODOS' ? undefined : statusFiltro === 'ATIVO',
  };

  const { data, isLoading } = usePacientes(params);

  const pacientes = data?.content ?? [];
  
  const paginationCount = buildTablePaginationCount(data, page, rowsPerPage);

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const [detalhePaciente, setDetalhePaciente] = useState<Paciente | null>(null);
  const openDetalhes = (p: Paciente) => navigate(`/pacientes/${p.id}`);
  const closeDetalhes = () => {
    setDetalhePaciente(null);
  };

  const handleToggleAtivo = async (paciente: Paciente) => {
    try {
      await toggleAtivo.mutateAsync({ id: paciente.id, isAtivo: !paciente.isAtivo });
      showToast(
        `Paciente ${!paciente.isAtivo ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
    } catch {
      showToast('Erro ao alterar status', 'error');
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
          borderRadius: 4,
          color: '#fff',
          background: 'linear-gradient(135deg, #0B4F41 0%, #0F6E56 100%)',
          boxShadow: '0 18px 50px rgba(8,80,65,0.18)',
        }}
      >
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Hub clínico
        </Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>
          Pacientes
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>
          Acesse dados cadastrais, odontograma, plano de tratamento e histórico em um só lugar.
        </Typography>
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
          select size="small" value={statusFiltro}
          onChange={(e) => { setStatusFiltro(e.target.value as StatusFiltro); setPage(0); }}
          sx={{ width: 140 }}
        >
          <MenuItem value="TODOS">Todos</MenuItem>
          <MenuItem value="ATIVO">Ativos</MenuItem>
          <MenuItem value="INATIVO">Inativos</MenuItem>
        </TextField>

        <Box sx={{ flex: 1 }} />

        <Badge color="warning" variant="dot" invisible={!hasDraft}
          sx={{ '& .MuiBadge-dot': { width: 8, height: 8, borderRadius: '50%' } }}>
          <Button variant="contained" startIcon={<AddOutlined sx={{ fontSize: 17 }} />}
            onClick={openNew} size="small" sx={{ height: 36, px: 2 }}>
            Novo paciente
          </Button>
        </Badge>
      </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Nome</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pacientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum paciente encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pacientes.map((p) => (
                  <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {p.nome}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">{p.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <DadoSensivel valor={p.telefone} tipo="telefone" />
                    </TableCell>
                    <TableCell>
                      <StatusChip isAtivo={p.isAtivo} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Detalhes">
                        <IconButton size="small" onClick={() => openDetalhes(p)}>
                          <InfoOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(p)}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={p.isAtivo ? 'Desativar' : 'Ativar'}>
                        <IconButton size="small" onClick={() => handleToggleAtivo(p)}
                          sx={{ color: p.isAtivo ? 'error.main' : 'success.main' }}>
                          {p.isAtivo
                            ? <ToggleOffOutlined sx={{ fontSize: 16 }} />
                            : <ToggleOnOutlined sx={{ fontSize: 16 }} />}
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

      <PacienteDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      <PacienteDetalheModal
        open={!!detalhePaciente}
        paciente={detalhePaciente}
        onClose={closeDetalhes}
      />

      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}