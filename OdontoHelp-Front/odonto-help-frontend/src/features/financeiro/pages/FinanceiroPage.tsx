import { useState, useEffect, useMemo } from 'react';
import {
  Alert, Autocomplete, Box, Button, Chip, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Skeleton,
  Snackbar, Stack, Tab, Tabs, TextField, Tooltip, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, TablePagination,
} from '@mui/material';
import {
  AddOutlined, AccountBalanceWalletOutlined, PaymentsOutlined,
  WarningAmberOutlined, TrendingUpOutlined, HealingOutlined, RepeatOutlined,
  DescriptionOutlined, EmailOutlined, WhatsApp, FileDownloadOutlined,
  EventAvailableOutlined, ContentCopyOutlined, EditNoteOutlined, MoreVert,
  OpenInNewOutlined, VisibilityOutlined, MoneyOffOutlined,
} from '@mui/icons-material';
import { usePacientes } from '../../pacientes/usePacientes';
import type { Paciente } from '../../pacientes/types';
import { useAtendimentosPendentesCobranca } from '../../atendimentos/useAtendimentos';
import {
  useAgendamentosHojePacienteIds, useCobrancas, useCriarCobranca,
  useCriarRecorrencia, useDashboardFinanceiro, useEncerrarRecorrencia, useEnviarLembreteEmail,
  useInadimplencia, useNfse, useNfseConfig, usePausarRecorrencia, usePerdoarParcela, useRecorrencia,
  useReativarRecorrencia, useAtualizarRecorrencia,
  useRegistrarNfseNumero, useRegistrarPagamento, FINANCEIRO_PAGE_SIZE,
} from '../useFinanceiro';
import type {
  AtendimentoPendenteCobranca, Cobranca, CobrancasFiltros, FormaPagamento, InadimplenciaFiltros,
  NfseFiscal, NfseFiltros, PendentesCobrancaFiltros, ParcelaReceber,
  StatusFinanceiro, StatusNfse,
} from '../types';
import {
  cobrancasFiltrosPadrao, inadimplenciaFiltrosPadrao, nfseFiltrosPadrao, pendentesFiltrosPadrao,
  type RecorrenciaCobranca,
} from '../types';
import { CobrancasFilterBar, InadimplenciaFilterBar, NfseFilterBar, PendentesFilterBar } from '../FinanceiroFilterBar';
import { buildWhatsAppCobrancaUrl, formatLembreteCobrancaMessage } from '../cobrancaNotificacao';
import { financeiroService } from '../financeiroService';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import GerarCobrancaAtendimentoDialog, { type GerarCobrancaAtendimentoInput } from '../GerarCobrancaAtendimentoDialog';
import {
  fmtMoeda, fmtData, parseValorInput, STATUS_FINANCEIRO_LABELS,
  FORMA_PAGAMENTO_LABELS, ORIGEM_COBRANCA_LABELS, STATUS_NFSE_LABELS,
} from '../financeiroLabels';
import { getApiErrorMessage } from '../../../shared/lib/axios';
import DataTable from '../../../design-system/components/DataTable';

const nfseStatusColor: Record<StatusNfse, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDENTE: 'warning',
  PROCESSANDO: 'info',
  EMITIDA: 'success',
  ERRO: 'error',
  CANCELADA: 'default',
};

function exportNfseCsv(rows: NfseFiscal[]) {
  const escape = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['ID', 'Pagamento', 'Paciente', 'Descrição', 'Valor', 'Status', 'Nº NFS-e', 'Criado em'];
  const lines = [
    header.join(';'),
    ...rows.map((r) => [
      r.id,
      r.externalChargeId,
      r.pacienteNome ?? r.externalCustomerId,
      r.descricaoServico ?? r.mensagem ?? '',
      r.valor ?? '',
      STATUS_NFSE_LABELS[r.status],
      r.nfseNumero ?? '',
      r.criadoEm,
    ].map(escape).join(';')),
  ];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nfse-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copiarParaClipboard(texto: string, onToast: (msg: string, isError?: boolean) => void) {
  try {
    await navigator.clipboard.writeText(texto);
    onToast('Copiado para a área de transferência.');
  } catch {
    onToast('Não foi possível copiar.', true);
  }
}

const statusColor: Record<StatusFinanceiro, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  ABERTA: 'info',
  PARCIALMENTE_PAGA: 'warning',
  PAGA: 'success',
  VENCIDA: 'error',
  CANCELADA: 'default',
};

const HEADER_GRADIENT =
  'radial-gradient(circle at top right, rgba(29,158,117,0.95), transparent 34%), linear-gradient(135deg, #063F35 0%, #0F6E56 58%, #0B4F41 100%)';

const FINANCEIRO_ACOES_CELL_SX = {
  width: 200,
  minWidth: 200,
  maxWidth: 200,
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
  verticalAlign: 'middle' as const,
};

const NFSE_ACOES_CELL_SX = {
  width: 56,
  minWidth: 56,
  maxWidth: 56,
  textAlign: 'center' as const,
  px: 0.5,
  verticalAlign: 'middle' as const,
};

function NfseRowAcoes({
  nfse,
  modoManual,
  portalUrl,
  onVer,
  onRegistrar,
}: {
  nfse: NfseFiscal;
  modoManual: boolean;
  portalUrl: string | null;
  onVer: () => void;
  onRegistrar: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);
  const podePortal = Boolean(portalUrl && (nfse.status === 'PENDENTE' || nfse.status === 'EMITIDA'));
  const podeRegistrar = modoManual && nfse.status === 'PENDENTE';

  return (
    <>
      <Tooltip title="Ações">
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={`Ações da NFS-e ${nfse.externalChargeId}`}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { setAnchor(null); onVer(); }}>
          <ListItemIcon><VisibilityOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Ver detalhes</ListItemText>
        </MenuItem>
        {podeRegistrar && (
          <MenuItem onClick={() => { setAnchor(null); onRegistrar(); }}>
            <ListItemIcon><EditNoteOutlined fontSize="small" /></ListItemIcon>
            <ListItemText>Registrar nº</ListItemText>
          </MenuItem>
        )}
        {podePortal && (
          <MenuItem
            component="a"
            href={portalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAnchor(null)}
          >
            <ListItemIcon><OpenInNewOutlined fontSize="small" /></ListItemIcon>
            <ListItemText>Abrir portal</ListItemText>
          </MenuItem>
        )}
        {modoManual && nfse.status === 'PENDENTE' && !portalUrl && (
          <MenuItem disabled>
            <ListItemIcon><OpenInNewOutlined fontSize="small" /></ListItemIcon>
            <ListItemText primary="Abrir portal" secondary="Não configurado" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function MetricCard({ label, value, loading, icon, color, bgColor, isCurrency = true }: {
  label: string; value: number; loading: boolean; icon: React.ReactNode;
  color: string; bgColor: string; isCurrency?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, minHeight: 120, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.05)' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>{label}</Typography>
          {loading ? <Skeleton width={80} height={36} sx={{ mt: 1 }} /> : (
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: 'text.primary', mt: 0.75 }}>
              {isCurrency ? fmtMoeda(value) : value}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function ResumoCards() {
  const { data, isLoading } = useDashboardFinanceiro();
  const cards = [
    { label: 'Em aberto', value: Number(data?.totalAberto ?? 0), icon: <AccountBalanceWalletOutlined />, color: '#0F6E56', bgColor: '#E1F5EE' },
    { label: 'Vencido', value: Number(data?.totalVencido ?? 0), icon: <WarningAmberOutlined />, color: '#C0392B', bgColor: '#FCEBEB' },
    { label: 'Recebido no mês', value: Number(data?.recebidoMes ?? 0), icon: <TrendingUpOutlined />, color: '#185FA5', bgColor: '#E6F1FB' },
    { label: 'Parcelas vencidas', value: Number(data?.parcelasVencidas ?? 0), icon: <PaymentsOutlined />, color: '#854F0B', bgColor: '#FAEEDA', isCurrency: false },
  ];
  return (
    <Grid container spacing={2.25}>
      {cards.map((c) => (
        <Grid item xs={12} sm={6} md={3} key={c.label}>
          <MetricCard {...c} loading={isLoading} isCurrency={c.isCurrency !== false} />
        </Grid>
      ))}
    </Grid>
  );
}

function CriarCobrancaDialog({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: (msg: string, isError?: boolean) => void;
}) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [busca, setBusca] = useState('');
  const { data: pacientesData } = usePacientes({ page: 0, size: 20, nome: busca || undefined });
  const criar = useCriarCobranca();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [vencimento, setVencimento] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const handleSubmit = async () => {
    if (!paciente) return;
    try {
      await criar.mutateAsync({
        pacienteId: paciente.id,
        descricao,
        valorBruto: parseValorInput(valor),
        quantidadeParcelas: Number(parcelas),
        primeiroVencimento: vencimento,
      });
      onSuccess('Cobrança avulsa criada!');
      onClose();
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao criar cobrança'), true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cobrança avulsa</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Use para taxas ou serviços fora do atendimento clínico. Procedimentos do consultório
          devem ser cobrados pela aba <strong>Atendimentos</strong>.
        </Alert>
        <Stack spacing={2}>
          <Autocomplete
            options={pacientesData?.content ?? []}
            getOptionLabel={(p) => p.nome}
            value={paciente}
            onChange={(_, v) => setPaciente(v)}
            onInputChange={(_, v) => setBusca(v)}
            renderInput={(params) => <TextField {...params} label="Paciente" />}
          />
          <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} fullWidth />
          <TextField label="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} fullWidth placeholder="0,00" />
          <Stack direction="row" spacing={2}>
            <TextField label="Parcelas" type="number" value={parcelas} onChange={(e) => setParcelas(e.target.value)} fullWidth />
            <TextField label="1º vencimento" type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={criar.isPending || !paciente || !descricao || !valor}>Criar</Button>
      </DialogActions>
    </Dialog>
  );
}

function PagamentoDialog({ parcela, open, onClose, onSuccess }: {
  parcela: ParcelaReceber | null; open: boolean; onClose: () => void;
  onSuccess: (msg: string, isError?: boolean) => void;
}) {
  const pagar = useRegistrarPagamento();
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState<FormaPagamento>('PIX');
  const hoje = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (parcela && open) {
      setValor(String(parcela.saldo));
      setForma('PIX');
    }
  }, [parcela, open]);

  const submit = async () => {
    if (!parcela) return;
    try {
      await pagar.mutateAsync({
        parcelaId: parcela.id,
        payload: { valor: parseValorInput(valor), dataPagamento: hoje, formaPagamento: forma },
      });
      onSuccess('Pagamento registrado!');
      onClose();
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao registrar pagamento'), true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar pagamento</DialogTitle>
      <DialogContent>
        {parcela && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {parcela.pacienteNome && (
              <Typography variant="body2" color="text.secondary">{parcela.pacienteNome}</Typography>
            )}
            <Typography variant="body2">
              {parcela.cobrancaDescricao ?? `Cobrança #${parcela.cobrancaId}`} · Parcela {parcela.numero}
            </Typography>
            <Typography variant="body2">Saldo: <strong>{fmtMoeda(parcela.saldo)}</strong></Typography>
            <TextField label="Valor pago" value={valor} onChange={(e) => setValor(e.target.value)} fullWidth />
            <TextField select label="Forma" value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)} fullWidth>
              {(Object.keys(FORMA_PAGAMENTO_LABELS) as FormaPagamento[]).map((f) => (
                <MenuItem key={f} value={f}>{FORMA_PAGAMENTO_LABELS[f]}</MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={pagar.isPending || !valor}>Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}

function origemLabel(c: Cobranca) {
  if (c.origemTipo === 'ATENDIMENTO' && c.origemIdExterno) {
    return `Atend. #${c.origemIdExterno}`;
  }
  return ORIGEM_COBRANCA_LABELS[c.origemTipo ?? 'MANUAL'] ?? 'Manual';
}

function recorrenciaStatusLabel(rec: RecorrenciaCobranca): { label: string; color: 'success' | 'warning' | 'default' } {
  if (rec.encerrada || rec.dataFim) return { label: 'Encerrada', color: 'default' };
  if (rec.ativa) return { label: 'Ativa', color: 'success' };
  return { label: 'Pausada', color: 'warning' };
}

function RecorrenciaDialog({ cobranca, open, onClose, onSuccess }: {
  cobranca: Cobranca | null; open: boolean; onClose: () => void;
  onSuccess: (msg: string, isError?: boolean) => void;
}) {
  const criar = useCriarRecorrencia();
  const pausar = usePausarRecorrencia();
  const reativar = useReativarRecorrencia();
  const atualizar = useAtualizarRecorrencia();
  const encerrar = useEncerrarRecorrencia();
  const { data: recorrencia, isLoading: loadingRecorrencia } = useRecorrencia(cobranca?.id, open);
  const [diaVencimento, setDiaVencimento] = useState('10');
  const [valorBase, setValorBase] = useState('');
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState('');
  const [proximaGeracao, setProximaGeracao] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (cobranca && open && !recorrencia && !loadingRecorrencia) {
      setValorBase(String(cobranca.saldoTotal > 0 ? cobranca.saldoTotal : cobranca.valorTotal));
      setDiaVencimento('10');
      setDataInicio(new Date().toISOString().slice(0, 10));
      setDataFim('');
      setProximaGeracao('');
      setObservacao('');
    }
  }, [cobranca, open, recorrencia, loadingRecorrencia]);

  useEffect(() => {
    if (recorrencia) {
      setDiaVencimento(String(recorrencia.diaVencimento));
      setValorBase(String(recorrencia.valorBase));
      setDataInicio(recorrencia.dataInicio);
      setDataFim(recorrencia.dataFim ?? '');
      setProximaGeracao(recorrencia.proximaGeracao);
      setObservacao(recorrencia.observacao ?? '');
    }
  }, [recorrencia]);

  const encerrada = recorrencia?.encerrada || !!recorrencia?.dataFim;
  const status = recorrencia ? recorrenciaStatusLabel(recorrencia) : null;

  const handleCriar = async () => {
    if (!cobranca) return;
    try {
      await criar.mutateAsync({
        cobrancaId: cobranca.id,
        payload: {
          diaVencimento: Number(diaVencimento),
          valorBase: parseValorInput(valorBase),
          dataInicio,
          dataFim: dataFim || undefined,
          observacao: observacao || undefined,
        },
      });
      onSuccess('Recorrência configurada!');
      onClose();
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao criar recorrência'), true);
    }
  };

  const handleSalvar = async () => {
    if (!recorrencia || encerrada) return;
    try {
      await atualizar.mutateAsync({
        id: recorrencia.id,
        payload: {
          diaVencimento: Number(diaVencimento),
          valorBase: parseValorInput(valorBase),
          dataFim: dataFim || null,
          proximaGeracao: proximaGeracao || undefined,
          observacao: observacao || undefined,
        },
      });
      onSuccess('Recorrência atualizada.');
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao atualizar recorrência'), true);
    }
  };

  const handlePausar = async () => {
    if (!recorrencia) return;
    try {
      await pausar.mutateAsync(recorrencia.id);
      onSuccess('Recorrência pausada.');
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao pausar recorrência'), true);
    }
  };

  const handleReativar = async () => {
    if (!recorrencia) return;
    try {
      await reativar.mutateAsync(recorrencia.id);
      onSuccess('Recorrência reativada.');
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao reativar recorrência'), true);
    }
  };

  const handleEncerrar = async () => {
    if (!recorrencia) return;
    try {
      await encerrar.mutateAsync(recorrencia.id);
      onSuccess('Recorrência encerrada. Novas parcelas não serão geradas.');
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao encerrar recorrência'), true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Recorrência — {cobranca?.descricao}</DialogTitle>
      <DialogContent>
        {loadingRecorrencia ? (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Skeleton height={24} />
            <Skeleton height={24} />
          </Stack>
        ) : recorrencia ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {status && (
              <Chip size="small" label={status.label} color={status.color} sx={{ alignSelf: 'flex-start' }} />
            )}
            {encerrada ? (
              <>
                <Typography variant="body2">
                  Valor mensal: <strong>{fmtMoeda(recorrencia.valorBase)}</strong> · Dia {recorrencia.diaVencimento}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Encerrada em {recorrencia.dataFim ? fmtData(recorrencia.dataFim) : '—'}. Parcelas já geradas permanecem na cobrança.
                </Typography>
              </>
            ) : (
              <>
                <TextField label="Valor mensal (R$)" value={valorBase} onChange={(e) => setValorBase(e.target.value)} fullWidth />
                <TextField label="Dia do vencimento" type="number" value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)} inputProps={{ min: 1, max: 28 }} fullWidth />
                <Stack direction="row" spacing={2}>
                  <TextField label="Próxima geração" type="date" value={proximaGeracao}
                    onChange={(e) => setProximaGeracao(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField label="Fim (opcional)" type="date" value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                </Stack>
                <TextField label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} fullWidth multiline rows={2} />
              </>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Gera novas parcelas mensais automaticamente nesta cobrança.
            </Alert>
            <TextField label="Valor mensal (R$)" value={valorBase} onChange={(e) => setValorBase(e.target.value)} fullWidth />
            <TextField label="Dia do vencimento" type="number" value={diaVencimento}
              onChange={(e) => setDiaVencimento(e.target.value)} inputProps={{ min: 1, max: 28 }} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Fim (opcional)" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} fullWidth multiline rows={2} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        {loadingRecorrencia ? null : recorrencia ? (
          encerrada ? null : (
            <>
              <Button variant="outlined" onClick={handleSalvar} disabled={atualizar.isPending || !valorBase}>
                {atualizar.isPending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
              {recorrencia.ativa ? (
                <Button onClick={handlePausar} disabled={pausar.isPending}>Pausar</Button>
              ) : (
                <Button onClick={handleReativar} disabled={reativar.isPending}>Reativar</Button>
              )}
              <Button color="error" onClick={handleEncerrar} disabled={encerrar.isPending}>
                {encerrar.isPending ? 'Encerrando…' : 'Encerrar'}
              </Button>
            </>
          )
        ) : (
          <Button variant="contained" onClick={handleCriar} disabled={criar.isPending || !valorBase}>Criar</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function RegistrarNfseNumeroDialog({ nfse, open, onClose, onSuccess }: {
  nfse: NfseFiscal | null; open: boolean; onClose: () => void;
  onSuccess: (msg: string, isError?: boolean) => void;
}) {
  const registrar = useRegistrarNfseNumero();
  const [numeroNfse, setNumeroNfse] = useState('');

  useEffect(() => {
    if (open) setNumeroNfse('');
  }, [open, nfse]);

  const submit = async () => {
    if (!nfse || !numeroNfse.trim()) return;
    try {
      await registrar.mutateAsync({ id: nfse.id, payload: { numeroNfse: numeroNfse.trim() } });
      onSuccess('Número da NFS-e registrado!');
      onClose();
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao registrar número'), true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar NFS-e emitida no OXY</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Pagamento #{nfse?.externalChargeId} — {nfse?.descricaoServico ?? nfse?.mensagem}
          </Typography>
          <TextField label="Número da NFS-e" value={numeroNfse} onChange={(e) => setNumeroNfse(e.target.value)} fullWidth autoFocus />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={registrar.isPending || !numeroNfse.trim()}>Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}

function NfseDetalheDialog({
  nfse,
  open,
  onClose,
  portalUrl,
  onToast,
}: {
  nfse: NfseFiscal | null;
  open: boolean;
  onClose: () => void;
  portalUrl: string | null;
  onToast: (msg: string, isError?: boolean) => void;
}) {
  if (!nfse) return null;

  const linhas: { campo: string; valor: string }[] = [
    { campo: 'Pagamento', valor: `#${nfse.externalChargeId}` },
    { campo: 'Paciente', valor: nfse.pacienteNome ?? `#${nfse.externalCustomerId}` },
    { campo: 'Descrição', valor: nfse.descricaoServico ?? nfse.mensagem ?? '—' },
    { campo: 'Valor', valor: nfse.valor != null ? fmtMoeda(nfse.valor) : '—' },
    { campo: 'Status', valor: STATUS_NFSE_LABELS[nfse.status] },
    { campo: 'Nº NFS-e', valor: nfse.nfseNumero ?? '—' },
    { campo: 'Criada em', valor: new Date(nfse.criadoEm).toLocaleString('pt-BR') },
    { campo: 'Atualizada em', valor: new Date(nfse.atualizadoEm).toLocaleString('pt-BR') },
  ];

  if (nfse.mensagem && nfse.mensagem !== nfse.descricaoServico) {
    linhas.push({ campo: 'Observação', valor: nfse.mensagem });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da NFS-e</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resumo para conferência interna. O documento fiscal oficial (PDF) fica no portal da prefeitura.
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600, width: '32%' }}>Campo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linhas.map((linha) => (
                <TableRow key={linha.campo}>
                  <TableCell sx={{ color: 'text.secondary', verticalAlign: 'top' }}>{linha.campo}</TableCell>
                  <TableCell>{linha.valor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        {nfse.nfseNumero && (
          <Button
            startIcon={<ContentCopyOutlined />}
            onClick={() => copiarParaClipboard(nfse.nfseNumero!, onToast)}
          >
            Copiar nº
          </Button>
        )}
        {portalUrl && (nfse.status === 'PENDENTE' || nfse.status === 'EMITIDA') && (
          <Button
            startIcon={<OpenInNewOutlined />}
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Portal prefeitura
          </Button>
        )}
        <Button
          startIcon={<FileDownloadOutlined />}
          onClick={() => {
            exportNfseCsv([nfse]);
            onToast('Planilha CSV baixada.');
          }}
        >
          Baixar CSV
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function CobrancasTab({ onToast }: { onToast: (msg: string, isError?: boolean) => void }) {
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState<CobrancasFiltros>(() => cobrancasFiltrosPadrao());
  const { data, isLoading, refetch } = useCobrancas(page, filtros);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhe, setDetalhe] = useState<Cobranca | null>(null);
  const [parcelaPagamento, setParcelaPagamento] = useState<ParcelaReceber | null>(null);
  const [recorrenciaCobranca, setRecorrenciaCobranca] = useState<Cobranca | null>(null);
  const rows = data?.content ?? [];

  const handleFiltros = (f: CobrancasFiltros) => {
    setFiltros(f);
    setPage(0);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Cobranças geradas manualmente ou a partir de atendimentos finalizados.
        </Typography>
        <Button startIcon={<AddOutlined />} variant="contained" onClick={() => setDialogOpen(true)}>
          Cobrança avulsa
        </Button>
      </Stack>

      <CobrancasFilterBar
        filtros={filtros}
        onChange={handleFiltros}
        onClear={() => handleFiltros(cobrancasFiltrosPadrao())}
      />

      <DataTable columns={8} fixedLayout loading={isLoading} empty={!isLoading && rows.length === 0} emptyTitle="Nenhuma cobrança" emptyDescription="Ajuste os filtros ou crie uma cobrança avulsa.">
        <TableHead>
          <TableRow>
            <TableCell>Paciente</TableCell>
            <TableCell sx={{ width: 120 }}>Origem</TableCell>
            <TableCell sx={{ width: 148 }}>Recorrência</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell sx={{ width: 96 }}>Total</TableCell>
            <TableCell sx={{ width: 96 }}>Saldo</TableCell>
            <TableCell sx={{ width: 120 }}>Status</TableCell>
            <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((c) => {
            const recorrenciaAtiva = c.recorrenciaAtiva === true;
            const recorrenciaPausada = c.recorrenciaPausada === true;
            const recorrenciaEncerrada = c.recorrenciaEncerrada === true;
            const temRecorrencia = recorrenciaAtiva || recorrenciaPausada || recorrenciaEncerrada;
            return (
              <TableRow key={c.id} hover sx={{ '& td': { verticalAlign: 'middle' } }}>
                <TableCell>{c.cliente.nome}</TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={origemLabel(c)} />
                </TableCell>
                <TableCell>
                  <Box sx={{ minHeight: 28, display: 'flex', alignItems: 'center' }}>
                    {recorrenciaAtiva && (
                      <Chip size="small" icon={<RepeatOutlined sx={{ fontSize: 14 }} />} label="Ativa" color="success" variant="outlined" />
                    )}
                    {recorrenciaPausada && (
                      <Chip size="small" label="Pausada" color="warning" variant="outlined" />
                    )}
                    {recorrenciaEncerrada && (
                      <Chip size="small" label="Encerrada" variant="outlined" />
                    )}
                    {!temRecorrencia && (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{c.descricao}</TableCell>
                <TableCell>{fmtMoeda(c.valorTotal)}</TableCell>
                <TableCell>{fmtMoeda(c.saldoTotal)}</TableCell>
                <TableCell>
                  <Chip size="small" label={STATUS_FINANCEIRO_LABELS[c.status]} color={statusColor[c.status]} />
                </TableCell>
                <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>
                  <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="nowrap">
                    <Button size="small" onClick={() => setDetalhe(c)}>Parcelas</Button>
                    {c.status !== 'CANCELADA' && (
                      <Button
                        size="small"
                        startIcon={<RepeatOutlined sx={{ fontSize: 16 }} />}
                        onClick={() => setRecorrenciaCobranca(c)}
                      >
                        {temRecorrencia ? 'Gerenciar' : 'Recorrência'}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>

      <TablePagination
        component="div"
        count={data?.totalElements ?? 0}
        page={page}
        rowsPerPage={FINANCEIRO_PAGE_SIZE}
        rowsPerPageOptions={[FINANCEIRO_PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        backIconButtonProps={{ disabled: page === 0 || isLoading }}
        nextIconButtonProps={{ disabled: (data?.number ?? 0) >= (data?.totalPages ?? 1) - 1 || isLoading }}
        sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
      />

      <CriarCobrancaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSuccess={onToast} />

      <Dialog open={!!detalhe} onClose={() => setDetalhe(null)} maxWidth="md" fullWidth>
        <DialogTitle>Parcelas — {detalhe?.descricao}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, minHeight: 32, display: 'flex', alignItems: 'center' }}>
            {detalhe && (detalhe.recorrenciaAtiva || detalhe.recorrenciaPausada || detalhe.recorrenciaEncerrada) && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                {detalhe.recorrenciaAtiva && (
                  <Chip size="small" icon={<RepeatOutlined sx={{ fontSize: 14 }} />} label="Recorrência ativa" color="success" variant="outlined" />
                )}
                {detalhe.recorrenciaPausada && (
                  <Chip size="small" label="Recorrência pausada" color="warning" variant="outlined" />
                )}
                {detalhe.recorrenciaEncerrada && (
                  <Chip size="small" label="Recorrência encerrada" variant="outlined" />
                )}
                {detalhe.status !== 'CANCELADA' && (
                  <Button
                    size="small"
                    startIcon={<RepeatOutlined sx={{ fontSize: 16 }} />}
                    onClick={() => setRecorrenciaCobranca(detalhe)}
                  >
                    Gerenciar recorrência
                  </Button>
                )}
              </Stack>
            )}
          </Box>
          <DataTable columns={6} empty={!detalhe?.parcelas.length} emptyTitle="Sem parcelas">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48 }}>#</TableCell>
                <TableCell sx={{ width: 120 }}>Vencimento</TableCell>
                <TableCell sx={{ width: 96 }}>Valor</TableCell>
                <TableCell sx={{ width: 96 }}>Saldo</TableCell>
                <TableCell sx={{ width: 120 }}>Status</TableCell>
                <TableCell align="right" sx={{ width: 100, whiteSpace: 'nowrap' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {detalhe?.parcelas.map((p) => (
                <TableRow key={p.id} sx={{ '& td': { verticalAlign: 'middle' } }}>
                  <TableCell>{p.numero}</TableCell>
                  <TableCell>{fmtData(p.dataVencimento)}</TableCell>
                  <TableCell>{fmtMoeda(p.valorTotal)}</TableCell>
                  <TableCell>{fmtMoeda(p.saldo)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={STATUS_FINANCEIRO_LABELS[p.status]} color={statusColor[p.status]} />
                  </TableCell>
                  <TableCell align="right">
                    {p.saldo > 0 && p.status !== 'CANCELADA' ? (
                      <Button size="small" startIcon={<PaymentsOutlined sx={{ fontSize: 16 }} />} onClick={() => setParcelaPagamento(p)}>
                        Pagar
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </DialogContent>
        <DialogActions><Button onClick={() => setDetalhe(null)}>Fechar</Button></DialogActions>
      </Dialog>

      <PagamentoDialog
        parcela={parcelaPagamento}
        open={!!parcelaPagamento}
        onClose={() => setParcelaPagamento(null)}
        onSuccess={async (msg, isError) => {
          onToast(msg, isError);
          if (!isError && detalhe) {
            const result = await refetch();
            const atualizada = result.data?.content.find((c) => c.id === detalhe.id);
            if (atualizada) setDetalhe(atualizada);
          }
        }}
      />

      <RecorrenciaDialog
        cobranca={recorrenciaCobranca}
        open={!!recorrenciaCobranca}
        onClose={() => setRecorrenciaCobranca(null)}
        onSuccess={(msg, isError) => {
          onToast(msg, isError);
          if (!isError) refetch();
        }}
      />
    </Box>
  );
}

function AtendimentosTab({ onToast, onError }: { onToast: (msg: string) => void; onError: (msg: string) => void }) {
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState<PendentesCobrancaFiltros>(() => pendentesFiltrosPadrao());
  const nomeDebounced = useDebounce(filtros.nomePaciente ?? '', 400);
  const filtrosQuery = useMemo(
    () => ({ ...filtros, nomePaciente: nomeDebounced || undefined }),
    [filtros, nomeDebounced],
  );
  const { data, isLoading } = useAtendimentosPendentesCobranca(page, filtrosQuery);
  const [dialogData, setDialogData] = useState<GerarCobrancaAtendimentoInput | null>(null);
  const rows: AtendimentoPendenteCobranca[] = data?.content ?? [];

  const handleFiltros = (f: PendentesCobrancaFiltros) => {
    setFiltros(f);
    setPage(0);
  };

  const abrirCobranca = (a: AtendimentoPendenteCobranca) => {
    setDialogData({
      pacienteId: a.pacienteId,
      atendimentoId: a.atendimentoId,
      pacienteNome: a.pacienteNome,
      itens: a.itensPendentes.map((i) => ({
        itemAtendimentoId: i.itemId,
        procedimentoId: i.procedimentoId,
        procedimentoNome: i.procedimentoNome,
        numeroDente: i.numeroDente,
        valorCobradoSnapshot: Number(i.valorCobradoSnapshot),
        valorReferencia: Number(i.valorCobradoSnapshot),
      })),
    });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Atendimentos finalizados com procedimentos ainda não enviados ao financeiro.
        Os valores são definidos no cadastro de procedimentos.
      </Typography>

      <PendentesFilterBar
        filtros={filtros}
        onChange={handleFiltros}
        onClear={() => handleFiltros(pendentesFiltrosPadrao())}
      />

      <DataTable
        columns={6}
        loading={isLoading}
        empty={!isLoading && rows.length === 0}
        emptyTitle="Nenhum atendimento pendente"
        emptyDescription="Quando um atendimento for finalizado, os procedimentos aparecerão aqui para cobrança."
      >
        <TableHead>
          <TableRow>
            <TableCell>Atendimento</TableCell>
            <TableCell>Paciente</TableCell>
            <TableCell>Dentista</TableCell>
            <TableCell>Procedimentos</TableCell>
            <TableCell>Total</TableCell>
            <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((a) => (
            <TableRow key={a.atendimentoId} hover>
              <TableCell>#{a.atendimentoId}</TableCell>
              <TableCell>{a.pacienteNome}</TableCell>
              <TableCell>{a.dentistaNome}</TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  {a.itensPendentes.slice(0, 2).map((i) => (
                    <Typography key={i.itemId} variant="caption" display="block">
                      {i.procedimentoNome} (dente {i.numeroDente}) — {fmtMoeda(Number(i.valorCobradoSnapshot))}
                    </Typography>
                  ))}
                  {a.itensPendentes.length > 2 && (
                    <Typography variant="caption" color="text.secondary">+{a.itensPendentes.length - 2} itens</Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>{fmtMoeda(Number(a.totalPendente))}</TableCell>
              <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>
                <Button size="small" variant="contained" onClick={() => abrirCobranca(a)}>Gerar cobrança</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <TablePagination
        component="div"
        count={buildTablePaginationCount(data, page, FINANCEIRO_PAGE_SIZE)}
        page={page}
        rowsPerPage={FINANCEIRO_PAGE_SIZE}
        rowsPerPageOptions={[FINANCEIRO_PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
        labelDisplayedRows={({ from, to }) => `${from}–${to}`}
        backIconButtonProps={{ disabled: page === 0 || isLoading }}
        nextIconButtonProps={{ disabled: (data?.last ?? true) || isLoading }}
        sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
      />

      <GerarCobrancaAtendimentoDialog
        open={!!dialogData}
        onClose={() => setDialogData(null)}
        data={dialogData}
        onSuccess={onToast}
        onError={onError}
      />
    </Box>
  );
}

function PerdoarParcelaDialog({ parcela, open, onClose, onSuccess }: {
  parcela: ParcelaReceber | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string, isError?: boolean) => void;
}) {
  const perdoar = usePerdoarParcela();
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (open) setMotivo('');
  }, [open, parcela]);

  const submit = async () => {
    if (!parcela) return;
    try {
      await perdoar.mutateAsync({
        parcelaId: parcela.id,
        observacao: motivo.trim() || undefined,
      });
      onSuccess(`Dívida de ${fmtMoeda(parcela.saldo)} perdoada.`);
      onClose();
    } catch (e) {
      onSuccess(getApiErrorMessage(e, 'Erro ao perdoar dívida'), true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Perdoar dívida</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            O saldo em aberto será cancelado e não poderá ser cobrado depois. Pagamentos já registrados são mantidos.
          </Alert>
          {parcela && (
            <Typography variant="body2" color="text.secondary">
              {parcela.pacienteNome ?? 'Paciente'} — parcela #{parcela.numero} — saldo {fmtMoeda(parcela.saldo)}
            </Typography>
          )}
          <TextField
            label="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: acordo comercial, cortesia, erro de cobrança"
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="warning" variant="contained" onClick={submit} disabled={perdoar.isPending}>
          {perdoar.isPending ? 'Salvando…' : 'Confirmar perdão'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InadimplenciaTab({ onToast }: { onToast: (msg: string, isError?: boolean) => void }) {
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState<InadimplenciaFiltros>(() => inadimplenciaFiltrosPadrao());
  const { data, isLoading } = useInadimplencia(page, filtros);
  const { data: consultasHojeIds } = useAgendamentosHojePacienteIds();
  const enviarEmail = useEnviarLembreteEmail();
  const [parcela, setParcela] = useState<ParcelaReceber | null>(null);
  const [parcelaPerdao, setParcelaPerdao] = useState<ParcelaReceber | null>(null);
  const rows = data?.content ?? [];

  const handleEmailLembrete = async (p: ParcelaReceber) => {
    try {
      await enviarEmail.mutateAsync({
        parcelaId: p.id,
        pacienteId: p.pacienteIdExterno,
      });
      onToast('Lembrete enviado por e-mail!');
    } catch (e) {
      onToast(getApiErrorMessage(e, 'Erro ao enviar lembrete'), true);
    }
  };

  const handleWhatsApp = (p: ParcelaReceber) => {
    const telefone = p.pacienteTelefone;
    if (!telefone) {
      onToast('Telefone do paciente não disponível.', true);
      return;
    }
    const url = buildWhatsAppCobrancaUrl(telefone, formatLembreteCobrancaMessage(p));
    if (!url) {
      onToast('Telefone inválido.', true);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFiltros = (f: InadimplenciaFiltros) => {
    setFiltros(f);
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Parcelas com vencimento em atraso e saldo em aberto.
      </Typography>

      <InadimplenciaFilterBar
        filtros={filtros}
        onChange={handleFiltros}
        onClear={() => handleFiltros(inadimplenciaFiltrosPadrao())}
      />

      <DataTable columns={6} loading={isLoading} empty={!isLoading && rows.length === 0} emptyTitle="Nenhuma parcela vencida" emptyDescription="Ajuste os filtros ou tudo está em dia.">
        <TableHead>
          <TableRow>
            <TableCell>Paciente / Cobrança</TableCell>
            <TableCell>Parcela</TableCell>
            <TableCell>Vencimento</TableCell>
            <TableCell>Saldo</TableCell>
            <TableCell>Consulta hoje</TableCell>
            <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((p) => {
            const consultaHoje = p.pacienteIdExterno != null && consultasHojeIds?.has(p.pacienteIdExterno);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <Typography variant="body2">{p.pacienteNome ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.cobrancaDescricao ?? `Cobrança #${p.cobrancaId}`}</Typography>
                </TableCell>
                <TableCell>#{p.numero}</TableCell>
                <TableCell>{fmtData(p.dataVencimento)}</TableCell>
                <TableCell>{fmtMoeda(p.saldo)}</TableCell>
                <TableCell>
                  {consultaHoje ? (
                    <Chip size="small" icon={<EventAvailableOutlined sx={{ fontSize: 14 }} />} label="Consulta hoje" color="warning" />
                  ) : (
                    <Typography variant="caption" color="text.disabled">—</Typography>
                  )}
                </TableCell>
                <TableCell sx={FINANCEIRO_ACOES_CELL_SX}>
                  <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" flexWrap="wrap" useFlexGap>
                    <Tooltip title="Enviar lembrete por e-mail">
                      <span>
                        <IconButton size="small" onClick={() => handleEmailLembrete(p)} disabled={enviarEmail.isPending}>
                          <EmailOutlined fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <span>
                        <IconButton size="small" onClick={() => handleWhatsApp(p)} disabled={!p.pacienteTelefone}>
                          <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button size="small" onClick={() => setParcela(p)}>Pagar</Button>
                    <Button size="small" color="warning" startIcon={<MoneyOffOutlined sx={{ fontSize: 16 }} />} onClick={() => setParcelaPerdao(p)}>
                      Perdoar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>

      <TablePagination
        component="div"
        count={data?.totalElements ?? 0}
        page={page}
        rowsPerPage={FINANCEIRO_PAGE_SIZE}
        rowsPerPageOptions={[FINANCEIRO_PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        backIconButtonProps={{ disabled: page === 0 || isLoading }}
        nextIconButtonProps={{ disabled: (data?.number ?? 0) >= (data?.totalPages ?? 1) - 1 || isLoading }}
        sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
      />

      <PagamentoDialog parcela={parcela} open={!!parcela} onClose={() => setParcela(null)} onSuccess={onToast} />
      <PerdoarParcelaDialog
        parcela={parcelaPerdao}
        open={!!parcelaPerdao}
        onClose={() => setParcelaPerdao(null)}
        onSuccess={onToast}
      />
    </Box>
  );
}

function NotasTab({ onToast, onGoToCobrancas }: { onToast: (msg: string, isError?: boolean) => void; onGoToCobrancas: () => void }) {
  const [page, setPage] = useState(0);
  const [filtros, setFiltros] = useState<NfseFiltros>(() => nfseFiltrosPadrao());
  const [exportando, setExportando] = useState(false);
  const { data: config } = useNfseConfig();
  const { data, isLoading, isError, error } = useNfse(page, filtros);
  const [registrarNfse, setRegistrarNfse] = useState<NfseFiscal | null>(null);
  const [verNfse, setVerNfse] = useState<NfseFiscal | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => new Set());
  const rows = data?.content ?? [];

  const handleFiltros = (f: NfseFiltros) => {
    setFiltros(f);
    setPage(0);
    setSelecionadas(new Set());
  };

  const toggleSelecionada = (id: string) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const idsPagina = rows.map((r) => r.id);
  const selecionadasNaPagina = idsPagina.filter((id) => selecionadas.has(id)).length;
  const paginaTodaSelecionada = idsPagina.length > 0 && selecionadasNaPagina === idsPagina.length;
  const paginaParcialmenteSelecionada = selecionadasNaPagina > 0 && !paginaTodaSelecionada;

  const togglePagina = () => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (paginaTodaSelecionada) {
        idsPagina.forEach((id) => next.delete(id));
      } else {
        idsPagina.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const exportarLinhas = async (modo: 'selecionadas' | 'filtradas') => {
    setExportando(true);
    try {
      const todas = await financeiroService.listarNfseTodas(filtros);
      const linhas = modo === 'selecionadas'
        ? todas.filter((r) => selecionadas.has(r.id))
        : todas;
      if (linhas.length === 0) {
        onToast(
          modo === 'selecionadas'
            ? 'Selecione ao menos uma nota para exportar.'
            : 'Nenhuma NFS-e encontrada com os filtros atuais.',
          true,
        );
        return;
      }
      exportNfseCsv(linhas);
      onToast(`${linhas.length} nota(s) exportada(s) em planilha CSV.`);
    } catch (e) {
      onToast(getApiErrorMessage(e, 'Erro ao exportar CSV'), true);
    } finally {
      setExportando(false);
    }
  };

  const modoManual = config?.modoEmissao === 'MANUAL';
  const portalUrl = config?.portalOxyUrl?.trim() || null;
  const integracaoAtiva = config?.habilitado === true;
  const temNotas = (data?.totalElements ?? rows.length) > 0;

  return (
    <Box>
      {!integracaoAtiva && (
        <Alert severity="info" sx={{ mb: 2 }}>
          A emissão de NFS-e ainda não está disponível para esta clínica.
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(error, 'Não foi possível carregar as notas. Tente atualizar a página.')}
        </Alert>
      )}

      {integracaoAtiva && !isLoading && !isError && !temNotas && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Ainda não há notas aqui. O fluxo é:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Gere uma cobrança (atendimento ou cobrança avulsa).</li>
            <li>Registre o pagamento em <strong>Cobranças → Parcelas → Pagar</strong>.</li>
            <li>A NFS-e aparece aqui automaticamente.</li>
            {modoManual && <li>Emita no portal da prefeitura e use <strong>Registrar nº</strong>.</li>}
          </Typography>
          <Button size="small" variant="outlined" sx={{ mt: 1.5 }} onClick={onGoToCobrancas}>
            Ir para cobranças
          </Button>
        </Alert>
      )}

      {integracaoAtiva && modoManual && (
        <Alert severity="info" sx={{ mb: 2 }}>
          O OdontoHelp registra o pagamento e o número da NFS-e. O PDF oficial é emitido e baixado no portal da prefeitura
          {portalUrl ? ' (use o botão abaixo).' : ' — peça ao suporte para configurar o link do portal.'}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            NFS-e geradas automaticamente após confirmação de pagamento.
            {modoManual
              ? ' Emita no portal da prefeitura e registre o número abaixo.'
              : ' Emissão automática via certificado digital.'}
            {modoManual && portalUrl && integracaoAtiva && (
              <>
                {' '}
                <Button
                  size="small"
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ verticalAlign: 'baseline', px: 0.5, minWidth: 0 }}
                >
                  Abrir portal da prefeitura
                </Button>
              </>
            )}
          </Typography>
          <NfseFilterBar filtros={filtros} onChange={handleFiltros} onClear={() => handleFiltros(nfseFiltrosPadrao())} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignSelf: { md: 'center' } }} flexWrap="wrap" useFlexGap>
          {selecionadas.size > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {selecionadas.size} selecionada(s)
            </Typography>
          )}
          {selecionadas.size > 0 && (
            <Button
              variant="contained"
              startIcon={<FileDownloadOutlined />}
              onClick={() => exportarLinhas('selecionadas')}
              disabled={exportando || !integracaoAtiva}
            >
              {exportando ? 'Exportando…' : 'Exportar selecionadas'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlined />}
            onClick={() => exportarLinhas('filtradas')}
            disabled={exportando || !integracaoAtiva || !temNotas}
          >
            {exportando ? 'Exportando…' : 'Exportar filtradas'}
          </Button>
        </Stack>
      </Stack>

      <DataTable columns={8} loading={isLoading} empty={!isLoading && rows.length === 0} emptyTitle="Nenhuma NFS-e" emptyDescription="Confirme um pagamento na aba Cobranças para gerar a nota automaticamente.">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              {integracaoAtiva && rows.length > 0 && (
                <Checkbox
                  size="small"
                  checked={paginaTodaSelecionada}
                  indeterminate={paginaParcialmenteSelecionada}
                  onChange={togglePagina}
                  inputProps={{ 'aria-label': 'Selecionar página' }}
                />
              )}
            </TableCell>
            <TableCell>Pagamento</TableCell>
            <TableCell>Paciente</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Criada em</TableCell>
            <TableCell sx={NFSE_ACOES_CELL_SX} aria-label="Ações" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((nfse) => (
            <TableRow key={nfse.id} hover selected={selecionadas.has(nfse.id)}>
              <TableCell padding="checkbox">
                {integracaoAtiva && (
                  <Checkbox
                    size="small"
                    checked={selecionadas.has(nfse.id)}
                    onChange={() => toggleSelecionada(nfse.id)}
                    inputProps={{ 'aria-label': `Selecionar NFS-e ${nfse.externalChargeId}` }}
                  />
                )}
              </TableCell>
              <TableCell>#{nfse.externalChargeId}</TableCell>
              <TableCell>{nfse.pacienteNome ?? `#${nfse.externalCustomerId}`}</TableCell>
              <TableCell>
                {nfse.descricaoServico ?? nfse.mensagem ?? '—'}
                {nfse.nfseNumero && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    NFS-e {nfse.nfseNumero}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{nfse.valor != null ? fmtMoeda(nfse.valor) : '—'}</TableCell>
              <TableCell>
                <Chip size="small" label={STATUS_NFSE_LABELS[nfse.status]} color={nfseStatusColor[nfse.status]} />
              </TableCell>
              <TableCell>{new Date(nfse.criadoEm).toLocaleString('pt-BR')}</TableCell>
              <TableCell sx={NFSE_ACOES_CELL_SX}>
                {!integracaoAtiva ? (
                  <Typography variant="caption" color="text.disabled">—</Typography>
                ) : (
                  <NfseRowAcoes
                    nfse={nfse}
                    modoManual={modoManual}
                    portalUrl={portalUrl}
                    onVer={() => setVerNfse(nfse)}
                    onRegistrar={() => setRegistrarNfse(nfse)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>

      <TablePagination
        component="div"
        count={data?.totalElements ?? 0}
        page={page}
        rowsPerPage={FINANCEIRO_PAGE_SIZE}
        rowsPerPageOptions={[FINANCEIRO_PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        backIconButtonProps={{ disabled: page === 0 || isLoading }}
        nextIconButtonProps={{ disabled: (data?.number ?? 0) >= (data?.totalPages ?? 1) - 1 || isLoading }}
        sx={{ borderTop: '0.5px solid', borderColor: 'divider', fontSize: '0.8rem' }}
      />

      <RegistrarNfseNumeroDialog
        nfse={registrarNfse}
        open={!!registrarNfse}
        onClose={() => setRegistrarNfse(null)}
        onSuccess={onToast}
      />

      <NfseDetalheDialog
        nfse={verNfse}
        open={!!verNfse}
        onClose={() => setVerNfse(null)}
        portalUrl={portalUrl}
        onToast={onToast}
      />
    </Box>
  );
}

export default function FinanceiroPage() {
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const showToast = (msg: string, isError?: boolean) =>
    setToast({ open: true, msg, severity: isError ? 'error' : 'success' });

  return (
    <Box>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5, borderRadius: 4, color: '#fff', background: HEADER_GRADIENT, boxShadow: '0 18px 50px rgba(8,80,65,0.18)' }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.72)' }}>Administrativo</Typography>
        <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>Financeiro</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75, maxWidth: 640 }}>
          Cobrança de procedimentos realizados, parcelas, inadimplência e recebimentos.
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}><ResumoCards /></Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab label="Cobranças" />
          <Tab label="Atendimentos pendentes" icon={<HealingOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Inadimplência" />
          <Tab label="Notas" icon={<DescriptionOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {tab === 0 && <CobrancasTab onToast={showToast} />}
          {tab === 1 && <AtendimentosTab onToast={(msg) => showToast(msg)} onError={(msg) => showToast(msg, true)} />}
          {tab === 2 && <InadimplenciaTab onToast={showToast} />}
          {tab === 3 && <NotasTab onToast={showToast} onGoToCobrancas={() => setTab(0)} />}
        </Box>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
