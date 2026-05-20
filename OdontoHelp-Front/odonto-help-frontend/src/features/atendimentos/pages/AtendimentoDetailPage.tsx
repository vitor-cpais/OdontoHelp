import {
  Box, Tabs, Tab,
  Typography, IconButton, Divider, Button, Stack,
  TextField, Alert, Chip, Paper, Skeleton,
} from '@mui/material';
import {
  Close, MedicalServicesOutlined, DeleteOutlined,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtendimento, useUpdateAtendimento, useFinalizarAtendimento } from '../useAtendimentos';
import OdontogramaVisual from '../../odontograma/OdontogramaVisual';
import { useOdontograma } from '../../odontograma/useOdontograma';
import type { OdontogramaMap } from '../../odontograma/types';
import OdontogramaSelectionDialog from '../../odontograma/OdontogramaSelectionDialog';
import HistoricoOdontogramaTab from '../../odontograma/HistoricoOdontogramaTab';
import AtendimentoStatusChip from '../AtendimentoStatusChip';
import AtendimentoProcedimentoDrawer from './AtendimentoProcedimentoDrawer';
import { getApiErrorMessage } from '../../../shared/lib/axios';
import { SITUACAO_DENTE_LABELS, SITUACAO_DENTE_COLORS } from '../types';
import type { Atendimento, ItemAtendimento } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface SituacaoTagProps {
  situacao: string | null;
}

function SituacaoTag({ situacao }: SituacaoTagProps) {
  if (!situacao) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const cor = SITUACAO_DENTE_COLORS[situacao as keyof typeof SITUACAO_DENTE_COLORS] || '#888';
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: `${cor}22`,
        color: cor,
        border: `1px solid ${cor}55`,
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      {SITUACAO_DENTE_LABELS[situacao as keyof typeof SITUACAO_DENTE_LABELS] || situacao}
    </Box>
  );
}

export default function AtendimentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const atendimentoId = id ? Number(id) : null;

  const { data: atendimento, isLoading } = useAtendimento(atendimentoId);
  const { data: mapaServidor } = useOdontograma(atendimento?.pacienteId ?? null);
  const update = useUpdateAtendimento(atendimentoId!);
  const finalizar = useFinalizarAtendimento();

  const [tab, setTab] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [selectedDentes, setSelectedDentes] = useState<number[]>([]);
  const [modalDentes, setModalDentes] = useState(false);
  const [drawerProcedimento, setDrawerProcedimento] = useState(false);
  const [items, setItems] = useState<ItemAtendimento[]>([]);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  useEffect(() => {
    if (atendimento) {
      setObservacoes(atendimento.observacoesGerais ?? '');
      setItems(atendimento.itens);
    }
  }, [atendimento]);

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
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Atendimento não encontrado</Alert>
      </Box>
    );
  }

  const isFinalizado = atendimento.status === 'FINALIZADO';

  const mapaLocal: OdontogramaMap = {
    ...(mapaServidor ?? {}),
    ...Object.fromEntries(
      items.map((item) => [
        item.numeroDente,
        {
          id: item.id,
          numeroDente: item.numeroDente,
          situacaoAtual: item.situacaoIdentificada,
          observacao: item.observacao ?? null,
          atualizadoEm: new Date().toISOString(),
        },
      ])
    ),
  };

  const handleDenteClick = (numero: number) => {
    setSelectedDentes((prev) => (
      prev.includes(numero) ? prev.filter((d) => d !== numero) : [...prev, numero]
    ));
  };

  const handleConfirmDentes = (dentes: number[]) => {
    setSelectedDentes(dentes);
    setModalDentes(false);
    setDrawerProcedimento(true);
  };

  const handleAddProcedimento = (novosItens: ItemAtendimento[]) => {
    setItems((prev) => [...prev, ...novosItens]);
    setSelectedDentes([]);
    setDrawerProcedimento(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSalvar = async () => {
    try {
      await update.mutateAsync({
        observacoesGerais: observacoes,
        itens: items.map((item) => ({
          procedimentoId: item.procedimentoId,
          numeroDente: item.numeroDente,
          face: item.face,
          situacaoIdentificada: item.situacaoIdentificada,
          observacao: item.observacao,
        })),
      });
      setToast({ open: true, msg: 'Atendimento salvo com sucesso!', severity: 'success' });
    } catch (e: any) {
      setToast({
        open: true,
        msg: getApiErrorMessage(e, 'Erro ao salvar'),
        severity: 'error',
      });
    }
  };

  const handleFinalizar = async () => {
    try {
      await update.mutateAsync({
        observacoesGerais: observacoes,
        itens: items.map((item) => ({
          procedimentoId: item.procedimentoId,
          numeroDente: item.numeroDente,
          face: item.face,
          situacaoIdentificada: item.situacaoIdentificada,
          observacao: item.observacao,
        })),
      });
      await finalizar.mutateAsync(atendimentoId!);
      setToast({
        open: true,
        msg: 'Atendimento finalizado! Odontograma atualizado.',
        severity: 'success',
      });
    } catch (e: any) {
      setToast({
        open: true,
        msg: getApiErrorMessage(e, 'Erro ao finalizar'),
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              backgroundColor: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MedicalServicesOutlined sx={{ fontSize: 17, color: '#0F6E56' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                  Atendimento #{atendimento.id}
                </Typography>
                <AtendimentoStatusChip status={atendimento.status} />
              </Box>
              <Typography variant="caption" color="text.disabled">
                {atendimento.pacienteNome} • {atendimento.dentistaNome}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => navigate('/atendimentos')}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Divider />

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
          <TabPanel value={tab} index={0}>
            <Stack spacing={2}>
              {isFinalizado && (
                <Alert severity="info">
                  Atendimento finalizado — apenas leitura.
                </Alert>
              )}
              <TextField
                label="ID Agendamento"
                value={atendimento.agendamentoId}
                fullWidth
                disabled
              />
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
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Stack spacing={2}>
              {!isFinalizado && (
                <Button
                  variant="outlined"
                  onClick={() => setModalDentes(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Selecionar dentes para procedimento
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                O odontograma reflete o estado clínico atual do paciente.
                As situações dos dentes são atualizadas automaticamente ao finalizar o atendimento.
              </Typography>
              <OdontogramaVisual
                pacienteId={atendimento.pacienteId}
                selectedDentes={selectedDentes}
                mapaOverride={mapaLocal}
              />
            </Stack>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={() => setModalDentes(true)}
                disabled={isFinalizado}
              >
                + Adicionar procedimento
              </Button>
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
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
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
                            <SituacaoTag situacao={item.situacaoIdentificada} />
                            {item.face && (
                              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {item.face}
                              </Box>
                            )}
                          </Box>
                          {item.observacao && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {item.observacao}
                            </Typography>
                          )}
                        </Box>
                        {!isFinalizado && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(idx)}
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

          <TabPanel value={tab} index={3}>
            <HistoricoOdontogramaTab pacienteId={atendimento.pacienteId} />
          </TabPanel>
        </Box>

        <Divider />

        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/atendimentos')}>
            Cancelar
          </Button>
          {!isFinalizado && (
            <>
              <Button
                variant="contained"
                onClick={handleSalvar}
                disabled={update.isPending}
              >
                Salvar
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleFinalizar}
                disabled={finalizar.isPending || items.length === 0}
              >
                Finalizar Atendimento
              </Button>
            </>
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

      <AtendimentoProcedimentoDrawer
        open={drawerProcedimento}
        dentes={selectedDentes}
        onClose={() => {
          setDrawerProcedimento(false);
          setSelectedDentes([]);
        }}
        onAddProcedimento={handleAddProcedimento}
      />

      {toast.open && (
        <Box
          onClick={() => setToast({ ...toast, open: false })}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: toast.severity === 'success' ? '#E1F5EE' : '#FFEBEE',
            color: toast.severity === 'success' ? '#0F6E56' : '#C0392B',
            border: `1px solid ${toast.severity === 'success' ? '#9FE1CB' : '#F5A5A5'}`,
            borderRadius: 2,
            p: 2,
            maxWidth: 300,
            cursor: 'pointer',
          }}
        >
          <Typography variant="body2">{toast.msg}</Typography>
        </Box>
      )}
    </Box>
  );
}
