import {
  Box, Tabs, Tab,
  Typography, IconButton, Divider, Button, Stack,
  TextField, Alert, Chip, Paper, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Close, MedicalServicesOutlined, DeleteOutlined,
} from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAtendimento, useUpdateAtendimento, useFinalizarAtendimento,
  useBaixaPlanoManual, useRemoverItemAtendimento,
} from '../useAtendimentos';
import BaixaPlanoDialog from '../BaixaPlanoDialog';
import type { ItemPlano } from '../../planoTratamento/types';
import OdontogramaVisual from '../../odontograma/OdontogramaVisual';
import OdontogramaSelectionDialog from '../../odontograma/OdontogramaSelectionDialog';
import HistoricoOdontogramaTab from '../../odontograma/HistoricoOdontogramaTab';
import AtendimentoStatusChip from '../AtendimentoStatusChip';
import AtendimentoProcedimentoDrawer from './AtendimentoProcedimentoDrawer';
import { getApiErrorMessage } from '../../../shared/lib/axios';
import { SITUACAO_DENTE_LABELS, SITUACAO_DENTE_COLORS } from '../types';
import type { ItemAtendimento } from '../types';
import { useOdontograma } from '../../odontograma/useOdontograma';
import type { OdontogramaMap } from '../../odontograma/types';
import { useItensPlanoPendentes } from '../../planoTratamento/usePlanoTratamento';
import AtendimentoAnexosSection from '../../arquivos/AtendimentoAnexosSection';
import { useGerarCobrancaAtendimento } from '../../financeiro/useFinanceiro';
import GerarCobrancaAtendimentoDialog, { type GerarCobrancaAtendimentoInput } from '../../financeiro/GerarCobrancaAtendimentoDialog';
import { fmtMoeda, STATUS_COBRANCA_ITEM_LABELS } from '../../financeiro/financeiroLabels';
import { useAuthStore } from '../../../shared/store/authStore';
import PlanoPendenteSugestao from '../PlanoPendenteSugestao';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function SituacaoTag({ situacao }: { situacao: string | null }) {
  if (!situacao) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const cor = SITUACAO_DENTE_COLORS[situacao as keyof typeof SITUACAO_DENTE_COLORS] || '#888';
  return (
    <Box sx={{
      display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1,
      backgroundColor: `${cor}22`, color: cor, border: `1px solid ${cor}55`,
      fontSize: '0.75rem', fontWeight: 500,
    }}>
      {SITUACAO_DENTE_LABELS[situacao as keyof typeof SITUACAO_DENTE_LABELS] || situacao}
    </Box>
  );
}

export default function AtendimentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const atendimentoId = id ? Number(id) : null;

  const { data: atendimento, isLoading } = useAtendimento(atendimentoId);
  const update = useUpdateAtendimento(atendimentoId!);
  const finalizar = useFinalizarAtendimento();
  const baixaManual = useBaixaPlanoManual(atendimentoId!);
  const removerItem = useRemoverItemAtendimento(atendimentoId!);
  const gerarCobranca = useGerarCobrancaAtendimento();
  const perfil = useAuthStore((s) => s.usuario?.perfil);
  const [cobrancaDialog, setCobrancaDialog] = useState<GerarCobrancaAtendimentoInput | null>(null);
  const { data: mapaServidor } = useOdontograma(atendimento?.pacienteId ?? null);
  const { data: itensPendentes } = useItensPlanoPendentes(atendimento?.pacienteId ?? null);

  const [tab, setTab] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [selectedDentes, setSelectedDentes] = useState<number[]>([]);
  const [modalDentes, setModalDentes] = useState(false);
  const [drawerProcedimento, setDrawerProcedimento] = useState(false);
  const [drawerSugestao, setDrawerSugestao] = useState<ItemPlano | null>(null);
  const [items, setItems] = useState<ItemAtendimento[]>([]);
  const [itemParaExcluir, setItemParaExcluir] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });
  const [baixaOpen, setBaixaOpen] = useState(false);
  const [baixaItens, setBaixaItens] = useState<ItemPlano[]>([]);
  const [baixaContext, setBaixaContext] = useState<'salvar' | 'finalizar' | null>(null);

  useEffect(() => {
    if (atendimento) {
      setObservacoes(atendimento.observacoesGerais ?? '');
      setItems(atendimento.itens);
    }
  }, [atendimento]);

  const itensPlanoRestantes = useMemo(() => {
    if (!itensPendentes?.length) return [];
    const idsCobertos = new Set(
      items.map((i) => i.itemPlanoOrigemId).filter((id): id is number => id != null),
    );
    const paresCobertos = new Set(
      items.map((item) => `${item.numeroDente}-${item.procedimentoId}`),
    );
    return itensPendentes.filter(
      (item) =>
        !idsCobertos.has(item.id) &&
        !paresCobertos.has(`${item.numeroDente}-${item.procedimentoId}`),
    );
  }, [itensPendentes, items]);

  const dentesPendentesPlano = useMemo(
    () => [...new Set(itensPlanoRestantes.map((i) => i.numeroDente))],
    [itensPlanoRestantes],
  );

  const sugestoesPlano = useMemo(() => {
    if (!itensPlanoRestantes.length || selectedDentes.length === 0) return [];
    return itensPlanoRestantes.filter((item) =>
      selectedDentes.includes(item.numeroDente),
    );
  }, [itensPlanoRestantes, selectedDentes]);

  if (!atendimento) {
    if (isLoading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
          ))}
        </Box>
      );
    }
    return <Box sx={{ p: 3 }}><Alert severity="error">Atendimento não encontrado</Alert></Box>;
  }

  const isFinalizado = atendimento.status === 'FINALIZADO';
  const totalPendentesPlano = itensPlanoRestantes.length;
  const itensPendentesCobranca = items.filter(
    (i) => i.statusCobranca !== 'ENVIADO' && i.statusCobranca !== 'COBRADO',
  );
  const totalCobrancaPendente = itensPendentesCobranca.reduce(
    (s, i) => s + (i.valorCobradoSnapshot ?? 0), 0,
  );

  // Mapa local — mescla servidor + itens ainda não salvos para feedback visual imediato
  const mapaLocal: OdontogramaMap = {
    ...(mapaServidor ?? {}),
    ...Object.fromEntries(
      items.map((item) => [
        item.numeroDente,
        {
          id: item.id,
          numeroDente: item.numeroDente,
          situacaoAtual: item.situacaoNova,
          observacao: item.observacao ?? null,
          atualizadoEm: new Date().toISOString(),
        },
      ])
    ),
  };

  const handleDenteClick = (numero: number) => {
    setSelectedDentes((prev) =>
      prev.includes(numero) ? prev.filter((d) => d !== numero) : [...prev, numero]
    );
  };

  const handleConfirmDentes = (dentes: number[]) => {
    setSelectedDentes(dentes);
    setModalDentes(false);
    setDrawerProcedimento(true);
  };

  const handleAddProcedimento = (novosItens: ItemAtendimento[]) => {
    setItems((prev) => [...prev, ...novosItens]);
    setSelectedDentes([]);
    setDrawerSugestao(null);
    setDrawerProcedimento(false);
  };

  const handleRegistrarDoPlano = (item: ItemPlano) => {
    setSelectedDentes([item.numeroDente]);
    setDrawerSugestao(item);
    setDrawerProcedimento(true);
  };

  const fecharDrawerProcedimento = () => {
    setDrawerProcedimento(false);
    setDrawerSugestao(null);
    setSelectedDentes([]);
  };

  const buildPayloadItens = () =>
    items
      .filter((item) => item.id < 0)
      .map((item) => ({
        procedimentoId: item.procedimentoId,
        numeroDente: item.numeroDente,
        situacaoNova: item.situacaoNova,
        observacao: item.observacao ?? '',
      }));

  const concluirFinalizacao = async () => {
    await finalizar.mutateAsync(atendimentoId!);
    setToast({ open: true, msg: 'Atendimento finalizado!', severity: 'success' });
    navigate('/atendimentos');
  };

  const handleSalvar = async () => {
    try {
      const novos = buildPayloadItens();
      const result = await update.mutateAsync({
        observacoesGerais: observacoes,
        itens: novos.length > 0 ? novos : undefined,
      });
      setItems(result.atendimento.itens);
      if (result.itensPlanoBaixaManual?.length > 0) {
        setBaixaContext('salvar');
        setBaixaItens(result.itensPlanoBaixaManual);
        setBaixaOpen(true);
      } else {
        setToast({ open: true, msg: 'Atendimento salvo com sucesso!', severity: 'success' });
      }
    } catch (e: unknown) {
      setToast({ open: true, msg: getApiErrorMessage(e, 'Erro ao salvar'), severity: 'error' });
    }
  };

  const handleFinalizar = async () => {
    try {
      const novos = buildPayloadItens();
      let result = null;
      if (novos.length > 0) {
        result = await update.mutateAsync({ observacoesGerais: observacoes, itens: novos });
      } else if (observacoes !== (atendimento.observacoesGerais ?? '')) {
        result = await update.mutateAsync({ observacoesGerais: observacoes });
      }

      if (result) {
        setItems(result.atendimento.itens);
        if (result.itensPlanoBaixaManual?.length > 0) {
          setBaixaContext('finalizar');
          setBaixaItens(result.itensPlanoBaixaManual);
          setBaixaOpen(true);
          return;
        }
      }

      await concluirFinalizacao();
    } catch (e: unknown) {
      setToast({ open: true, msg: getApiErrorMessage(e, 'Erro ao finalizar'), severity: 'error' });
    }
  };

  const handleBaixaConfirm = async (ids: number[]) => {
    try {
      const shouldFinalize = baixaContext === 'finalizar';
      await baixaManual.mutateAsync(ids);
      setBaixaOpen(false);
      setBaixaContext(null);
      if (!shouldFinalize) {
        setToast({ open: true, msg: 'Baixa no plano registrada!', severity: 'success' });
        return;
      }
    } catch (e: unknown) {
      setToast({ open: true, msg: getApiErrorMessage(e, 'Erro na baixa manual'), severity: 'error' });
      return;
    }

    try {
      await concluirFinalizacao();
    } catch (e: unknown) {
      setToast({ open: true, msg: getApiErrorMessage(e, 'Erro ao finalizar'), severity: 'error' });
    }
  };

  const handleBaixaClose = async () => {
    const shouldFinalize = baixaContext === 'finalizar';
    setBaixaOpen(false);
    setBaixaContext(null);

    if (!shouldFinalize) {
      setToast({ open: true, msg: 'Atendimento salvo!', severity: 'success' });
      return;
    }

    try {
      await concluirFinalizacao();
    } catch (e: unknown) {
      setToast({ open: true, msg: getApiErrorMessage(e, 'Erro ao finalizar'), severity: 'error' });
    }
  };

  const handleCancelar = () => {
    setObservacoes(atendimento.observacoesGerais ?? '');
    setItems(atendimento.itens);
    setSelectedDentes([]);
  };

  return (
    <Box>
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 18px 50px rgba(22,43,35,0.10)' }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#fff',
            background: 'linear-gradient(135deg, #082F2A 0%, #0F6E56 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MedicalServicesOutlined sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h2" sx={{ color: '#fff' }}>
                  Atendimento #{atendimento.id}
                </Typography>
                <AtendimentoStatusChip status={atendimento.status} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                {atendimento.pacienteNome} • {atendimento.dentistaNome}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => navigate('/atendimentos')} sx={{ color: '#fff' }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 1.5,
            backgroundColor: 'background.default',
          }}
        >
          {[
            { label: 'Paciente', value: atendimento.pacienteNome },
            { label: 'Procedimentos', value: `${items.length} registrado${items.length === 1 ? '' : 's'}` },
            {
              label: 'Plano de tratamento',
              value: totalPendentesPlano > 0
                ? `${totalPendentesPlano} item${totalPendentesPlano === 1 ? '' : 's'} pendente${totalPendentesPlano === 1 ? '' : 's'}`
                : 'Em dia',
            },
          ].map((item) => (
            <Paper key={item.label} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="overline" color="text.disabled">
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 3,
            borderBottom: '0.5px solid',
            borderColor: 'divider',
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, fontSize: '0.82rem', textTransform: 'none' },
          }}
        >
          <Tab label="Dados" />
          <Tab label="Odontograma" />
          <Tab label={`Procedimentos (${items.length})`} />
          <Tab label="Histórico" />
        </Tabs>

        <Box sx={{ px: 3, py: 2 }}>
          {/* ── Aba Dados ── */}
          <TabPanel value={tab} index={0}>
            <Stack spacing={2}>
              {isFinalizado && (
                <Alert severity="info">Atendimento finalizado — apenas leitura.</Alert>
              )}
              {atendimento.agendamentoOrigem === 'AVULSA' ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label="Atendimento avulso"
                    size="small"
                    sx={{ bgcolor: '#FAEEDA', color: '#854F0B', border: '1px solid #FAC775' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Sem agenda prévia · agendamento #{atendimento.agendamentoId}
                  </Typography>
                </Stack>
              ) : (
                <TextField label="ID Agendamento" value={atendimento.agendamentoId} fullWidth disabled />
              )}
              <TextField
                label="Hora de início"
                type="datetime-local"
                value={atendimento.horaInicio?.slice(0, 16) ?? ''}
                fullWidth
                disabled={isFinalizado}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Observações gerais"
                multiline
                minRows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                fullWidth
                disabled={isFinalizado}
              />
              {itensPlanoRestantes.length > 0 && (
                <Box sx={{
                  p: 2, border: '1px solid', borderColor: '#F59E0B',
                  borderRadius: 2, bgcolor: '#FFFBF0',
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400E', display: 'block', mb: 1 }}>
                    Plano pendente — {itensPlanoRestantes.length} item{itensPlanoRestantes.length > 1 ? 's' : ''}
                  </Typography>
                  <Stack spacing={0.5}>
                    {itensPlanoRestantes.map((item) => (
                      <Typography key={item.id} variant="caption" color="text.secondary">
                        • Dente {item.numeroDente} — {item.procedimentoNome}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
              <AtendimentoAnexosSection
                pacienteId={atendimento.pacienteId}
                atendimentoId={atendimento.id}
                somenteLeitura={isFinalizado}
                onSuccess={(msg) => setToast({ open: true, msg, severity: 'success' })}
                onError={(msg) => setToast({ open: true, msg, severity: 'error' })}
              />
            </Stack>
          </TabPanel>

          {/* ── Aba Odontograma ── */}
          <TabPanel value={tab} index={1}>
            <Stack spacing={2}>
              {selectedDentes.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {selectedDentes.map((d) => (
                    <Chip
                      key={d}
                      label={String(d)}
                      onDelete={() => setSelectedDentes((prev) => prev.filter((x) => x !== d))}
                    />
                  ))}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setDrawerSugestao(null);
                      setDrawerProcedimento(true);
                    }}
                    sx={{ ml: 'auto' }}
                  >
                    Adicionar procedimento
                  </Button>
                </Box>
              )}
              {!isFinalizado && (
                <PlanoPendenteSugestao
                  itens={sugestoesPlano}
                  onRegistrar={handleRegistrarDoPlano}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                A cor do dente é aplicada ao salvar ou finalizar o atendimento.
                A borda laranja some ao registrar o procedimento previsto no plano
                {totalPendentesPlano > 0 && ` (${totalPendentesPlano} item${totalPendentesPlano === 1 ? '' : 's'} ainda pendente${totalPendentesPlano === 1 ? '' : 's'})`}.
                Selecione o dente para ver sugestões.
              </Typography>
              <OdontogramaVisual
                pacienteId={atendimento.pacienteId}
                selectedDentes={selectedDentes}
                onDenteClick={isFinalizado ? undefined : handleDenteClick}
                mapaOverride={mapaLocal}
                dentesPendentesPlano={dentesPendentesPlano}
              />
            </Stack>
          </TabPanel>

          {/* ── Aba Procedimentos ── */}
          <TabPanel value={tab} index={2}>
            <Stack spacing={2}>
              {!isFinalizado && (
                <Button
                  variant="outlined"
                  onClick={() => setModalDentes(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  + Adicionar procedimento
                </Button>
              )}
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'auto', maxHeight: 400 }}>
                {items.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.disabled">
                      Nenhum procedimento adicionado
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1} sx={{ p: 2 }}>
                    {items.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5, borderRadius: 1, border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {item.procedimentoNome}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                              Dente {item.numeroDente}
                            </Box>
                            <SituacaoTag situacao={item.situacaoNova} />
                          </Box>
                          {item.observacao && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {item.observacao}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {fmtMoeda(item.valorCobradoSnapshot ?? 0)}
                            </Typography>
                            {item.statusCobranca && (
                              <Chip
                                size="small"
                                label={STATUS_COBRANCA_ITEM_LABELS[item.statusCobranca] ?? item.statusCobranca}
                                color={item.statusCobranca === 'PENDENTE' ? 'warning' : item.statusCobranca === 'ENVIADO' ? 'info' : 'success'}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                        {!isFinalizado && (
                          <IconButton
                            size="small"
                            onClick={() => setItemParaExcluir(item.id)}
                            sx={{ color: 'error.main', ml: 1 }}
                          >
                            <DeleteOutlined sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </TabPanel>

          {/* ── Aba Histórico ── */}
          <TabPanel value={tab} index={3}>
            <HistoricoOdontogramaTab pacienteId={atendimento.pacienteId} />
          </TabPanel>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {!isFinalizado && (
            <Button variant="outlined" onClick={handleCancelar}>
              Cancelar
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/atendimentos')}>
            Voltar
          </Button>
          {!isFinalizado && (
            <>
              <Button variant="contained" onClick={handleSalvar} disabled={update.isPending}>
                {update.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleFinalizar}
                disabled={finalizar.isPending || update.isPending}
              >
                {finalizar.isPending ? 'Finalizando...' : 'Finalizar Atendimento'}
              </Button>
            </>
          )}
          {isFinalizado && perfil === 'ADMIN' && itensPendentesCobranca.length > 0 && (
            <Button
              variant="contained"
              color="secondary"
              disabled={gerarCobranca.isPending}
              onClick={() => setCobrancaDialog({
                pacienteId: atendimento.pacienteId,
                atendimentoId: atendimento.id,
                pacienteNome: atendimento.pacienteNome,
                itens: itensPendentesCobranca.map((i) => ({
                  itemAtendimentoId: i.id,
                  procedimentoId: i.procedimentoId,
                  procedimentoNome: i.procedimentoNome,
                  numeroDente: i.numeroDente,
                  valorCobradoSnapshot: i.valorCobradoSnapshot ?? 0,
                  valorReferencia: i.valorCobradoSnapshot ?? 0,
                })),
              })}
            >
              Gerar cobrança ({fmtMoeda(totalCobrancaPendente)})
            </Button>
          )}
        </Box>
      </Paper>

      <OdontogramaSelectionDialog
        open={modalDentes}
        pacienteId={atendimento.pacienteId}
        selectedDentes={selectedDentes}
        onConfirm={handleConfirmDentes}
        onClose={() => setModalDentes(false)}
      />

      <BaixaPlanoDialog
        open={baixaOpen}
        itens={baixaItens}
        onClose={handleBaixaClose}
        onConfirm={handleBaixaConfirm}
        loading={baixaManual.isPending || finalizar.isPending}
      />

      <GerarCobrancaAtendimentoDialog
        open={!!cobrancaDialog}
        onClose={() => setCobrancaDialog(null)}
        data={cobrancaDialog}
        onSuccess={(msg) => setToast({ open: true, msg, severity: 'success' })}
        onError={(msg) => setToast({ open: true, msg, severity: 'error' })}
      />

      <AtendimentoProcedimentoDrawer
        open={drawerProcedimento}
        dentes={selectedDentes}
        sugestaoPlano={drawerSugestao}
        onClose={fecharDrawerProcedimento}
        onAddProcedimento={handleAddProcedimento}
      />

      {/* Dialog confirmação de exclusão de procedimento */}
      <Dialog open={itemParaExcluir !== null} onClose={() => setItemParaExcluir(null)}>
        <DialogTitle>Remover procedimento?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            O procedimento será removido da lista. A alteração só será salva ao clicar em "Salvar".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemParaExcluir(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              const idRem = itemParaExcluir!;
              if (idRem > 0) {
                try {
                  await removerItem.mutateAsync(idRem);
                  setItems((prev) => prev.filter((i) => i.id !== idRem));
                } catch (e: unknown) {
                  setToast({ open: true, msg: getApiErrorMessage(e, 'Erro ao remover'), severity: 'error' });
                }
              } else {
                setItems((prev) => prev.filter((i) => i.id !== idRem));
              }
              setItemParaExcluir(null);
            }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      {toast.open && (
        <Box
          onClick={() => setToast({ ...toast, open: false })}
          sx={{
            position: 'fixed', bottom: 16, right: 16,
            backgroundColor: toast.severity === 'success' ? '#E1F5EE' : '#FFEBEE',
            color: toast.severity === 'success' ? '#0F6E56' : '#C0392B',
            border: `1px solid ${toast.severity === 'success' ? '#9FE1CB' : '#F5A5A5'}`,
            borderRadius: 2, p: 2, maxWidth: 300, cursor: 'pointer', zIndex: 9999,
          }}
        >
          <Typography variant="body2">{toast.msg}</Typography>
        </Box>
      )}
    </Box>
  );
}
