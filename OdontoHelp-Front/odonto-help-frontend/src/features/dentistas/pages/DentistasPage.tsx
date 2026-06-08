import {
  Box, Button, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment, Badge,
} from '@mui/material';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import {
  AddOutlined, EditOutlined, ToggleOnOutlined,
  ToggleOffOutlined, SearchOutlined,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useDentistas, useToggleAtivoDentista } from '../useDentistas';
import { useDentistaDrawerStore } from '../dentistaStore';
import { useAuthStore } from '../../../shared/store/authStore';
import StatusChip from '../../../shared/components/StatusChip';
import DentistaDrawer from '../DentistaDrawer'; // 🌟 Corrigido aqui!
import type { Dentista } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { getApiErrorMessage } from '../../../shared/lib/axios';
import DadoSensivel from '../../../shared/components/DadoSensivel';
type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';

export default function DentistasPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODOS');
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const nomeBusca = useDebounce(busca, 400);
  const usuarioLogadoId = useAuthStore((s) => s.usuario?.id);
  const perfil = useAuthStore((s) => s.usuario?.perfil);
  const podeCadastrarDentista = perfil === 'ADMIN';
  const { openNew, openEdit, hasDraft } = useDentistaDrawerStore();
  const toggleAtivo = useToggleAtivoDentista();

  const params = {
    page,
    size: rowsPerPage,
    nome: nomeBusca || undefined,
    isAtivo: statusFiltro === 'TODOS' ? undefined : statusFiltro === 'ATIVO',
  };


  const { data, isLoading } = useDentistas(params);
  const paginationCount = buildTablePaginationCount(data, page, rowsPerPage);

  const dentistas = data?.content ?? [];

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const podeDesativar = (dentista: Dentista) =>
    dentista.id !== usuarioLogadoId || !dentista.isAtivo;

  const handleToggleAtivo = async (dentista: Dentista) => {
    if (!podeDesativar(dentista)) {
      showToast('Você não pode desativar o próprio acesso.', 'error');
      return;
    }
    try {
      await toggleAtivo.mutateAsync({ id: dentista.id, isAtivo: !dentista.isAtivo });
      showToast(
        `Dentista ${!dentista.isAtivo ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Erro ao alterar status'), 'error');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #123B35 0%, #0F6E56 100%)', boxShadow: '0 18px 50px rgba(8,80,65,0.18)' }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>Equipe clínica</Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>Dentistas</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>Gerencie profissionais, CRO e disponibilidade operacional.</Typography>
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

        {podeCadastrarDentista && (
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
              Novo dentista
            </Button>
          </Badge>
        )}
      </Box>
      </Paper>

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Nome</TableCell>
                <TableCell>CRO</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : dentistas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum dentista encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                dentistas.map((d) => (
                  <TableRow
                    key={d.id}
                    hover
                    sx={{ cursor: podeCadastrarDentista ? 'pointer' : 'default' }}
                    onClick={podeCadastrarDentista ? () => openEdit(d) : undefined}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {d.nome}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">{d.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {d.cro}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <DadoSensivel valor={d.telefone} tipo="telefone" />
                    </TableCell>
                    <TableCell>
                      <StatusChip isAtivo={d.isAtivo} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {podeCadastrarDentista && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(d)}>
                              <EditOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          {podeDesativar(d) ? (
                            <Tooltip title={d.isAtivo ? 'Desativar' : 'Ativar'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleAtivo(d)}
                                sx={{ color: d.isAtivo ? 'error.main' : 'success.main' }}
                              >
                                {d.isAtivo
                                  ? <ToggleOffOutlined sx={{ fontSize: 16 }} />
                                  : <ToggleOnOutlined sx={{ fontSize: 16 }} />
                                }
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Você não pode desativar o próprio acesso">
                              <span>
                                <IconButton size="small" disabled sx={{ opacity: 0.4 }}>
                                  <ToggleOffOutlined sx={{ fontSize: 16 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </>
                      )}
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

      {/* Drawer */}
      <DentistaDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Toast */}
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