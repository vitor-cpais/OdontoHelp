import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { EmptyState } from '../../design-system/components';
import { buildTablePaginationCount } from '../../shared/utils/pagination';
import { getApiErrorMessage } from '../../shared/lib/axios';
import { useCriarPacienteObservacao, usePacienteObservacoes } from './usePacientes';
import type { PacienteObservacao } from './types';

const MAX_LEN = 1000;
const PAGE_SIZE = 5;
const LIST_MAX_HEIGHT = 300;

function formatDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ObservacaoItem({ item }: { item: PacienteObservacao }) {
  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.25,
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {item.autorNome}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
          {formatDataHora(item.criadoEm)}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        title={item.texto.length > 200 ? item.texto : undefined}
      >
        {item.texto}
      </Typography>
    </Box>
  );
}

interface Props {
  pacienteId: number;
  canEdit: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function PacienteObservacoesListaCard({
  pacienteId,
  canEdit,
  onSuccess,
  onError,
}: Props) {
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching } = usePacienteObservacoes(pacienteId, page, PAGE_SIZE);
  const criar = useCriarPacienteObservacao(pacienteId);
  const [novoTexto, setNovoTexto] = useState('');
  const [expanded, setExpanded] = useState(false);

  const itens = data?.content ?? [];
  const paginationCount = buildTablePaginationCount(data, page, PAGE_SIZE);
  const showPagination = !isLoading && itens.length > 0;

  const handleAdicionar = async () => {
    const texto = novoTexto.trim();
    if (!texto) return;
    try {
      await criar.mutateAsync(texto);
      setNovoTexto('');
      setExpanded(false);
      setPage(0);
      onSuccess('Observação adicionada!');
    } catch (e) {
      onError(getApiErrorMessage(e, 'Erro ao adicionar observação'));
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography variant="h3">Observações</Typography>
          <Typography variant="caption" color="text.secondary">
            Mais recentes primeiro · {PAGE_SIZE} por página
          </Typography>
        </Box>
        {canEdit && !expanded && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
            onClick={() => setExpanded(true)}
            sx={{ flexShrink: 0 }}
          >
            Nova
          </Button>
        )}
      </Stack>

      {expanded && canEdit && (
        <Stack spacing={1.5} sx={{ mt: 1.5, mb: 1.5, flexShrink: 0 }}>
          <TextField
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            autoFocus
            size="small"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value.slice(0, MAX_LEN))}
            placeholder="Ex.: discutir opções de tratamento na próxima consulta..."
            helperText={`${novoTexto.length}/${MAX_LEN}`}
            disabled={criar.isPending}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              onClick={() => { setExpanded(false); setNovoTexto(''); }}
              disabled={criar.isPending}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleAdicionar}
              disabled={criar.isPending || !novoTexto.trim()}
              startIcon={criar.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              Adicionar
            </Button>
          </Stack>
        </Stack>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 160,
          maxHeight: LIST_MAX_HEIGHT,
          overflowY: 'auto',
          position: 'relative',
          borderRadius: 2,
          border: '1px solid',
          borderColor: itens.length > 0 ? 'divider' : 'transparent',
          bgcolor: itens.length > 0 ? 'rgba(15,110,86,0.02)' : 'transparent',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 160 }}>
            <CircularProgress size={28} />
          </Box>
        ) : itens.length === 0 ? (
          <Box sx={{ py: 3, px: 1 }}>
            <EmptyState
              title="Nenhuma observação ainda"
              description={canEdit ? 'Use Nova para registrar algo a discutir ou lembrar depois.' : undefined}
            />
          </Box>
        ) : (
          <Stack spacing={1} sx={{ p: 1 }}>
            {itens.map((item) => (
              <ObservacaoItem key={item.id} item={item} />
            ))}
          </Stack>
        )}
        {isFetching && !isLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.6)',
              borderRadius: 2,
            }}
          >
            <CircularProgress size={22} />
          </Box>
        )}
      </Box>

      {showPagination && (
        <TablePagination
          component="div"
          count={paginationCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to }) => `${from}–${to}`}
          backIconButtonProps={{ disabled: page === 0 || isFetching }}
          nextIconButtonProps={{ disabled: (data?.last ?? true) || isFetching }}
          sx={{
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 1,
            px: 0,
            '& .MuiTablePagination-toolbar': { minHeight: 40, pl: 0, pr: 0 },
            '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': { fontSize: '0.75rem' },
          }}
        />
      )}
    </Paper>
  );
}
