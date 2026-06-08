// src/features/usuarios/pages/UsuariosPage.tsx
import {
  Box, Button, TextField, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, TablePagination,
  Snackbar, Alert, Skeleton, InputAdornment, Badge, Chip,
} from '@mui/material';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import {
  AddOutlined, EditOutlined, ToggleOnOutlined,
  ToggleOffOutlined, SearchOutlined,
} from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { useUsuarios, useToggleAtivoUsuario } from '../useUsuarios';
import { useUsuarioDrawerStore } from '../usuarioStore';
import StatusChip from '../../../shared/components/StatusChip';
import UsuarioDrawer from '../UsuarioDrawer';
import type { Usuario } from '../types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import DadoSensivel from '../../../shared/components/DadoSensivel';
import { useAuthStore } from '../../../shared/store/authStore';
import { getApiErrorMessage } from '../../../shared/lib/axios';

type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';
type PerfilFiltro = '' | 'ADMIN' | 'DENTISTA' | 'PACIENTE' | 'RECEPCAO';

const PERFIL_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  RECEPCAO: 'Recepção',
  DENTISTA: 'Dentista',
  PACIENTE: 'Paciente',
};

const PERFIL_COLOR: Record<string, 'default' | 'primary' | 'info' | 'secondary'> = {
  ADMIN: 'primary',
  RECEPCAO: 'info',
  DENTISTA: 'secondary',
  PACIENTE: 'default',
};

export default function UsuariosPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [busca, setBusca] = useState('');
  const [perfilFiltro, setPerfilFiltro] = useState<PerfilFiltro>('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('ATIVO');
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const nomeBusca = useDebounce(busca, 400);
  const usuarioLogadoId = useAuthStore((s) => s.usuario?.id);
  const { openNew, openEdit, hasDraft } = useUsuarioDrawerStore();
  const toggleAtivo = useToggleAtivoUsuario();

  const params = {
    page,
    size: rowsPerPage,
    nome: nomeBusca || undefined,
    perfil: perfilFiltro || undefined,
    isAtivo: statusFiltro === 'TODOS' ? undefined : statusFiltro === 'ATIVO',
  };

  const { data, isLoading } = useUsuarios(params);
  
  const usuarios = data?.content ?? [];
  
  const paginationCount = buildTablePaginationCount(data, page, rowsPerPage);

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const podeDesativar = (usuario: Usuario) =>
    usuario.id !== usuarioLogadoId || !usuario.isAtivo;

  const handleToggleAtivo = async (usuario: Usuario) => {
    if (!podeDesativar(usuario)) {
      showToast('Você não pode desativar o próprio acesso.', 'error');
      return;
    }
    try {
      await toggleAtivo.mutateAsync({ id: usuario.id, isAtivo: !usuario.isAtivo });
      showToast(
        `Usuário ${!usuario.isAtivo ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Erro ao alterar status'), 'error');
    }
  };

  return (
    <Box>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5, borderRadius: 4, color: '#fff', background: 'linear-gradient(135deg, #1F3D38 0%, #0F6E56 100%)', boxShadow: '0 18px 50px rgba(8,80,65,0.18)' }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>Sistema</Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>Usuários</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>Controle perfis, acessos e status da equipe.</Typography>
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
          select size="small" value={perfilFiltro}
          onChange={(e) => { setPerfilFiltro(e.target.value as PerfilFiltro); setPage(0); }}
          sx={{ width: 160 }}
        >
          <MenuItem value="">Todos os perfis</MenuItem>
          <MenuItem value="ADMIN">Administrador</MenuItem>
          <MenuItem value="RECEPCAO">Recepção</MenuItem>
          <MenuItem value="DENTISTA">Dentista</MenuItem>
          <MenuItem value="PACIENTE">Paciente</MenuItem>
        </TextField>

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

        <Badge
          color="warning" variant="dot" invisible={!hasDraft}
          sx={{ '& .MuiBadge-dot': { width: 8, height: 8, borderRadius: '50%' } }}
        >
          <Button
            variant="contained"
            startIcon={<AddOutlined sx={{ fontSize: 17 }} />}
            onClick={openNew}
            size="small"
            sx={{ height: 36, px: 2 }}
          >
            Novo usuário
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
                <TableCell>Perfil</TableCell>
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
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum usuário encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow
                    key={u.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => openEdit(u)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {u.nome}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PERFIL_LABEL[u.perfil] ?? u.perfil}
                        color={PERFIL_COLOR[u.perfil] ?? 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <DadoSensivel valor={u.telefone} tipo="telefone" />
                    </TableCell>
                    <TableCell>
                      <StatusChip isAtivo={u.isAtivo} />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => openEdit(u)}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {podeDesativar(u) ? (
                        <Tooltip title={u.isAtivo ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleAtivo(u)}
                            sx={{ color: u.isAtivo ? 'error.main' : 'success.main' }}
                          >
                            {u.isAtivo
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
      <UsuarioDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open} autoHideDuration={3500}
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