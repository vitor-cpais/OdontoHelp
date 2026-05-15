// src/features/planoTratamento/PlanoTratamentoTab.tsx
import {
  Box, Typography, Button, Skeleton, Chip, Stack,
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, MenuItem, TextField,
  Snackbar, Alert, Tooltip,
} from '@mui/material';
import {
  AddOutlined, ExpandMoreOutlined, AssignmentOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { usePlanosPorPaciente, useAtualizarStatusItem } from './usePlanoTratamento';
import PlanoTratamentoDrawer from './PlanoTratamentoDrawer';
import {
  STATUS_ITEM_PLANO_LABELS, STATUS_ITEM_PLANO_COLORS,
} from './types';
import type { StatusItemPlano, ItemPlano, PlanoDeTratamento } from './types';

const PRIORIDADE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Alta',  color: '#C0392B' },
  2: { label: 'Média', color: '#BA7517' },
  3: { label: 'Baixa', color: '#185FA5' },
};

function ItemStatusSelect({
  planoId,
  item,
  onSuccess,
  onError,
}: {
  planoId: number;
  item: ItemPlano;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const atualizar = useAtualizarStatusItem();
  const isRealizado = item.status === 'REALIZADO';
  const colors = STATUS_ITEM_PLANO_COLORS[item.status];

  const handleChange = async (novoStatus: StatusItemPlano) => {
    try {
      await atualizar.mutateAsync({ planoId, itemId: item.id, status: novoStatus });
      onSuccess('Status do item atualizado!');
    } catch (e: any) {
      onError(e.message ?? 'Erro ao atualizar status');
    }
  };

  if (isRealizado) {
    return (
      <Chip
        label={STATUS_ITEM_PLANO_LABELS[item.status]}
        size="small"
        sx={{
          fontSize: '0.68rem', height: 22, borderRadius: '6px',
          backgroundColor: colors.bg, color: colors.text,
          border: '1px solid', borderColor: colors.border,
          fontWeight: 500,
        }}
      />
    );
  }

  return (
    <TextField
      select
      size="small"
      value={item.status}
      onChange={(e) => handleChange(e.target.value as StatusItemPlano)}
      disabled={atualizar.isPending}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontSize: '0.72rem', height: 26,
          backgroundColor: colors.bg,
          color: colors.text,
          '& fieldset': { borderColor: colors.border },
        },
      }}
    >
      {(Object.keys(STATUS_ITEM_PLANO_LABELS) as StatusItemPlano[])
        .filter((s) => s !== 'REALIZADO')
        .map((s) => (
          <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>
            {STATUS_ITEM_PLANO_LABELS[s]}
          </MenuItem>
        ))}
    </TextField>
  );
}

function PlanoCard({
  plano,
  onSuccess,
  onError,
}: {
  plano: PlanoDeTratamento;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const pendentes = plano.itens.filter((i) => i.status === 'PENDENTE').length;
  const realizados = plano.itens.filter((i) => i.status === 'REALIZADO').length;

  return (
    <Accordion
      variant="outlined"
      defaultExpanded={plano.itens.some((i) => i.status !== 'REALIZADO')}
      sx={{ borderRadius: '8px !important', '&:before': { display: 'none' }, mb: 1 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ borderRadius: 2, minHeight: 56 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
          <AssignmentOutlined sx={{ fontSize: 18, color: '#0F6E56' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Plano #{plano.id} · {plano.dentistaNome}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {new Date(plano.criadoEm).toLocaleDateString('pt-BR')}
              {plano.atendimentoId && ` · Atendimento #${plano.atendimentoId}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {pendentes > 0 && (
              <Chip label={`${pendentes} pendente${pendentes > 1 ? 's' : ''}`} size="small"
                sx={{ fontSize: '0.68rem', height: 20, backgroundColor: '#FAEEDA', color: '#854F0B', border: '1px solid #FAC775' }} />
            )}
            <Chip label={`${realizados}/${plano.itens.length}`} size="small"
              sx={{ fontSize: '0.68rem', height: 20, backgroundColor: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }} />
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, px: 0 }}>
        {plano.observacoes && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {plano.observacoes}
            </Typography>
          </Box>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Procedimento</TableCell>
                <TableCell>Dente</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plano.itens.map((item) => {
                const prio = PRIORIDADE_LABELS[item.prioridade];
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2">{item.procedimentoNome}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {item.numeroDente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: prio.color, fontWeight: 600 }}>
                        {prio.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ItemStatusSelect
                        planoId={plano.id}
                        item={item}
                        onSuccess={onSuccess}
                        onError={onError}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {item.observacao ?? '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

interface Props {
  pacienteId: number;
  dentistaId?: number; // pré-preenche o drawer se vier da tela do dentista
}

export default function PlanoTratamentoTab({ pacienteId, dentistaId }: Props) {
  const [page, setPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const { data, isLoading } = usePlanosPorPaciente(pacienteId, page);
  const planos = data?.content ?? [];

  const showToast = (msg: string, severity: 'success' | 'error') =>
    setToast({ open: true, msg, severity });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
          onClick={() => setDrawerOpen(true)}
          sx={{ height: 34 }}
        >
          Novo plano
        </Button>
      </Box>

      {isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : planos.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <AssignmentOutlined sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.disabled">
            Nenhum plano de tratamento cadastrado
          </Typography>
        </Box>
      ) : (
        planos.map((plano) => (
          <PlanoCard
            key={plano.id}
            plano={plano}
            onSuccess={(msg) => showToast(msg, 'success')}
            onError={(msg) => showToast(msg, 'error')}
          />
        ))
      )}

      {!data?.last && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button size="small" onClick={() => setPage((p) => p + 1)}>
            Carregar mais
          </Button>
        </Box>
      )}

      <PlanoTratamentoDrawer
        open={drawerOpen}
        pacienteId={pacienteId}
        dentistaId={dentistaId}
        onClose={() => setDrawerOpen(false)}
        onSuccess={(msg) => { showToast(msg, 'success'); setDrawerOpen(false); }}
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
