import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useGerarCobrancaAtendimento } from './useFinanceiro';
import { fmtMoeda, parseValorInput } from './financeiroLabels';
import { getApiErrorMessage } from '../../shared/lib/axios';

export interface ItemCobravel {
  itemAtendimentoId: number;
  procedimentoId: number;
  procedimentoNome: string;
  numeroDente?: number;
  valorCobradoSnapshot: number;
  valorReferencia?: number;
}

export interface GerarCobrancaAtendimentoInput {
  pacienteId: number;
  atendimentoId: number;
  pacienteNome: string;
  itens: ItemCobravel[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: GerarCobrancaAtendimentoInput | null;
  onSuccess: (msg: string, cobrancaId?: number) => void;
  onError: (msg: string) => void;
}

export default function GerarCobrancaAtendimentoDialog({ open, onClose, data, onSuccess, onError }: Props) {
  const gerar = useGerarCobrancaAtendimento();
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [valores, setValores] = useState<Record<number, string>>({});
  const [desconto, setDesconto] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [vencimento, setVencimento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (open && data) {
      setSelecionados(new Set(data.itens.map((i) => i.itemAtendimentoId)));
      setValores(Object.fromEntries(
        data.itens.map((i) => [i.itemAtendimentoId, String(i.valorCobradoSnapshot ?? 0)]),
      ));
      setDesconto('');
      setParcelas('1');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setVencimento(d.toISOString().slice(0, 10));
    }
  }, [open, data]);

  const itensAtivos = useMemo(
    () => data?.itens.filter((i) => selecionados.has(i.itemAtendimentoId)) ?? [],
    [data, selecionados],
  );

  const subtotal = itensAtivos.reduce(
    (s, i) => s + parseValorInput(valores[i.itemAtendimentoId] ?? String(i.valorCobradoSnapshot ?? 0)),
    0,
  );
  const descontoNum = desconto ? parseValorInput(desconto) : 0;
  const total = Math.max(0, subtotal - descontoNum);

  const toggle = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!data || itensAtivos.length === 0 || total <= 0) return;
    try {
      const cobranca = await gerar.mutateAsync({
        pacienteId: data.pacienteId,
        atendimentoId: data.atendimentoId,
        descricao: `Atendimento #${data.atendimentoId} — ${data.pacienteNome}`,
        itens: itensAtivos.map((i) => ({
          itemAtendimentoId: i.itemAtendimentoId,
          procedimentoId: i.procedimentoId,
          procedimentoNome: i.procedimentoNome,
          valorCobradoSnapshot: parseValorInput(valores[i.itemAtendimentoId] ?? String(i.valorCobradoSnapshot ?? 0)),
        })),
        quantidadeParcelas: Number(parcelas) || 1,
        primeiroVencimento: vencimento,
        valorDesconto: descontoNum > 0 ? descontoNum : undefined,
        idempotencyKey: `atendimento-${data.atendimentoId}`,
      });
      onSuccess(`Cobrança #${cobranca.id} criada (${fmtMoeda(cobranca.valorTotal)})`, cobranca.id);
      onClose();
    } catch (e) {
      onError(getApiErrorMessage(e, 'Erro ao gerar cobrança'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerar cobrança do atendimento</DialogTitle>
      <DialogContent>
        {!data ? null : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Valores de referência do atendimento. Ajuste por item ou aplique desconto no total antes de gerar a cobrança.
            </Alert>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Paciente: {data.pacienteNome} · Atendimento #{data.atendimentoId}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Procedimento</TableCell>
                    <TableCell>Dente</TableCell>
                    <TableCell align="right">Ref.</TableCell>
                    <TableCell align="right">Cobrar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.itens.map((item) => {
                    const ref = item.valorReferencia ?? item.valorCobradoSnapshot ?? 0;
                    const selecionado = selecionados.has(item.itemAtendimentoId);
                    return (
                      <TableRow key={item.itemAtendimentoId} hover selected={selecionado}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selecionado} onChange={() => toggle(item.itemAtendimentoId)} />
                        </TableCell>
                        <TableCell>{item.procedimentoNome}</TableCell>
                        <TableCell>{item.numeroDente ?? '—'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">{fmtMoeda(ref)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ width: 120 }}>
                          <TextField
                            size="small"
                            value={valores[item.itemAtendimentoId] ?? ''}
                            onChange={(e) => setValores((v) => ({ ...v, [item.itemAtendimentoId]: e.target.value }))}
                            disabled={!selecionado}
                            inputProps={{ style: { textAlign: 'right' } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Desconto (R$)"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                placeholder="0,00"
                fullWidth
                helperText="Opcional — aplicado sobre o subtotal dos itens"
              />
              <TextField
                label="Parcelas"
                type="number"
                inputProps={{ min: 1, max: 24 }}
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                fullWidth
              />
              <TextField
                label="1º vencimento"
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Stack spacing={0.5}>
                <Typography variant="body2">Subtotal: {fmtMoeda(subtotal)}</Typography>
                {descontoNum > 0 && (
                  <Typography variant="body2" color="error.main">Desconto: −{fmtMoeda(descontoNum)}</Typography>
                )}
                <Typography variant="body1" fontWeight={700}>
                  Total: {fmtMoeda(total)}
                  {Number(parcelas) > 1 && total > 0 && ` · ${parcelas}x de ${fmtMoeda(total / Number(parcelas))}`}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={gerar.isPending || itensAtivos.length === 0 || total <= 0}
        >
          {gerar.isPending ? 'Gerando...' : 'Gerar cobrança'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
