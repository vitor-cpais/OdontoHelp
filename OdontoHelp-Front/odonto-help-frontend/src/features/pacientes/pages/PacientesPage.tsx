import {
  Box, Button, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment, Badge,
} from '@mui/material';
import {
  AddOutlined, EditOutlined, ToggleOnOutlined, ToggleOffOutlined, SearchOutlined,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { usePacientes, useToggleAtivoPaciente } from '../usePacientes';
import { usePacienteDrawerStore } from '../pacienteStore';
import StatusChip from '../../../shared/components/StatusChip';
import PacienteDrawer from '../PacienteDrawer';
import type { Paciente } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { maskTelefone } from '../../../shared/utils/masks';

type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';

export default function PacientesPage() {
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

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
            onClick={openNew} size="small" sx={{ height: 36 }}>
            Novo paciente
          </Button>
        </Badge>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '0.5px solid', borderColor: 'divider' }}>
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
                  <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => openEdit(p)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {p.nome}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">{p.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{maskTelefone(p.telefone)}</Typography>
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
          component="div" count={-1} page={page} rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]} onPageChange={(_, p) => setPage(p)}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
          nextIconButtonProps={{ disabled: data?.last ?? true }}
          sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
        />
      </Paper>

      <PacienteDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
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
