import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Tabs, Tab, Typography, IconButton, Divider,
  Chip, Button, TextField, MenuItem, Snackbar, Alert,
  Popover, Paper, Stack,
} from '@mui/material';
import { Close, PersonOutlined, EditOutlined, ListAltOutlined, HistoryOutlined } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../shared/store/authStore';
import { useOdontograma, useUpdateOdontograma } from '../odontograma/useOdontograma';
import { SITUACAO_DENTE_LABELS } from '../atendimentos/types';
import { formatDataFromISO } from '../../shared/utils/masks';
import DadoSensivel from '../../shared/components/DadoSensivel';
import type { SituacaoDente } from '../atendimentos/types';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';
import { useAtendimentosPorPaciente } from '../atendimentos/useAtendimentos';
import HistoricoOdontogramaTab from '../odontograma/HistoricoOdontogramaTab';
import PlanoTratamentoTab from '../planoTratamento/PlanoTratamentoTab';
import PlanoTratamentoDrawer from '../planoTratamento/PlanoTratamentoDrawer';
import { useItensPlanoPendentes } from '../planoTratamento/usePlanoTratamento';
import type { Paciente } from './types';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2.5 }}>
      {value === index && children}
    </Box>
  );
}

interface Props { open: boolean; paciente: Paciente | null; onClose: () => void; }

const schemaDente = z.object({
  situacaoAtual: z.string().min(1, 'Situação obrigatória'),
  observacao: z.string().optional().default(''),
});
type FormDente = z.infer<typeof schemaDente>;

export default function PacienteDetalheModal({ open, paciente, onClose }: Props) {
  const perfil           = useAuthStore((s) => s.usuario?.perfil);
  const currentDentistaId = useAuthStore((s) => s.usuario?.dentistaId ?? undefined);
  const hasClinicoAccess = perfil === 'ADMIN' || perfil === 'DENTISTA';
  const navigate = useNavigate();

  // ── estado de abas ──
  const [tab, setTab] = useState(0);

  // ── estado odontograma ──
  const [selectedDentes, setSelectedDentes] = useState<number[]>([]);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [denteFiltroHistorico, setDenteFiltroHistorico] = useState<number | null>(null);
  const localIdRef = useRef(-1);

  // ── popover contextual ──
  const [popoverAnchor, setPopoverAnchor] = useState<{ el: HTMLElement; dente: number } | null>(null);

  // ── plano drawer ──
  const [planoDrawerOpen, setPlanoDrawerOpen] = useState(false);
  const [denteParaPlano, setDenteParaPlano] = useState<number | null>(null);

  // ── snack ──
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  // ── queries ──
  const { data: mapaOdontograma } = useOdontograma(paciente?.id ?? null);
  const updateOdontograma = useUpdateOdontograma(paciente?.id ?? null);
  const { data: atendimentosData } = useAtendimentosPorPaciente(paciente?.id ?? null, 0);
  const { data: itensPendentes } = useItensPlanoPendentes(paciente?.id ?? null);
  const atendimentoAtivo = atendimentosData?.content?.find((a: any) => a.status === 'EM_ANDAMENTO');

  // ── form do drawer de atualizar dente ──
  const { control: controlDente, handleSubmit: handleSubmitDente, reset: resetDente, formState: { errors: errorsDente } } = useForm<FormDente>({
    resolver: zodResolver(schemaDente),
    defaultValues: { situacaoAtual: '', observacao: '' },
  });

  useEffect(() => {
    if (!hasClinicoAccess && tab !== 0) setTab(0);
  }, [hasClinicoAccess, tab]);

  useEffect(() => {
    if (!open) {
      setTab(0);
      setSelectedDentes([]);
      setDrawerAberto(false);
      setDenteFiltroHistorico(null);
      setPopoverAnchor(null);
      resetDente();
    }
  }, [open]);

  if (!paciente) return null;

  // ── handlers odontograma ──
  const handleDenteClick = (numero: number) => {
    setSelectedDentes((prev) =>
      prev.includes(numero) ? prev.filter((d) => d !== numero) : [...prev, numero]
    );
  };

  const handleConfirmarDrawer = async (data: FormDente) => {
    try {
      await Promise.all(
        selectedDentes.map((numeroDente) =>
          updateOdontograma.mutateAsync({
            numeroDente,
            situacaoAtual: data.situacaoAtual,
            observacao: data.observacao || null,
          })
        )
      );
      setSelectedDentes([]);
      setDrawerAberto(false);
      resetDente();
      setSnack({ open: true, msg: `Dente${selectedDentes.length > 1 ? 's' : ''} atualizado${selectedDentes.length > 1 ? 's' : ''} com sucesso`, severity: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Erro ao atualizar dente(s)', severity: 'error' });
    }
  };

  const handleVerHistorico = (numeroDente: number) => {
    setDenteFiltroHistorico(numeroDente);
    setTab(2);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutlined sx={{ fontSize: 20, color: '#0F6E56' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>{paciente.nome}</Typography>
              <Typography variant="caption" color="text.disabled">
                CPF: <DadoSensivel valor={paciente.cpf} tipo="cpf" /> •{' '}
                <Box component="span" sx={{ color: paciente.isAtivo ? '#0F6E56' : '#888' }}>{paciente.isAtivo ? 'Ativo' : 'Inativo'}</Box>
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose}><Close sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>

        <Divider />

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 3, borderBottom: '0.5px solid', borderColor: 'divider', minHeight: 44, '& .MuiTab-root': { minHeight: 44, fontSize: '0.82rem', textTransform: 'none' } }}
        >
          <Tab label="Dados" />
          {hasClinicoAccess && <Tab label="Odontograma" />}
          {hasClinicoAccess && <Tab label="Histórico" />}
          {hasClinicoAccess && <Tab label="Plano de tratamento" />}
        </Tabs>

        <DialogContent sx={{ p: 0, px: 3, minHeight: 420 }}>
          {/* ── Aba Dados ── */}
          <TabPanel value={tab} index={0}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField label="Nome" value={paciente.nome} disabled fullWidth size="small" />
                <DadoSensivel valor={paciente.cpf} tipo="cpf" variant="textfield" label="CPF" size="small" fullWidth />
                <TextField label="E-mail" value={paciente.email ?? '—'} disabled fullWidth size="small" />
                {paciente.telefone
                  ? <DadoSensivel valor={paciente.telefone} tipo="telefone" variant="textfield" label="Telefone" size="small" fullWidth />
                  : <TextField label="Telefone" value="—" disabled fullWidth size="small" />}
                <TextField label="Data de nascimento" value={paciente.dataNascimento ? formatDataFromISO(paciente.dataNascimento) : '—'} disabled fullWidth size="small" />
                <TextField label="Gênero" value={paciente.genero ?? '—'} disabled fullWidth size="small" />
              </Box>
              {paciente.observacoesMedicas && (
                <TextField label="Anamnese" value={paciente.observacoesMedicas} disabled fullWidth size="small" multiline minRows={2} />
              )}
            </Stack>
          </TabPanel>

          {/* ── Aba Odontograma ── */}
          {hasClinicoAccess && (
            <TabPanel value={tab} index={1}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    Clique num dente para ver opções. Use "Selecionar dentes" para atualizar vários de uma vez.
                  </Typography>
                  {atendimentoAtivo && (
                    <Button size="small" variant="outlined" color="secondary" onClick={() => navigate(`/atendimentos/${atendimentoAtivo.id}`)}>
                      Ir para atendimento #{atendimentoAtivo.id}
                    </Button>
                  )}
                </Box>

                {selectedDentes.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {selectedDentes.map((d) => (
                      <Chip key={d} label={String(d)} size="small" onDelete={() => setSelectedDentes((prev) => prev.filter((x) => x !== d))} />
                    ))}
                    <Button size="small" variant="contained" onClick={() => setDrawerAberto(true)} sx={{ ml: 'auto' }}>
                      Atualizar status
                    </Button>
                  </Box>
                )}

                <OdontogramaVisual
                  pacienteId={paciente.id}
                  selectedDentes={selectedDentes}
                  onDenteClick={handleDenteClick}
                  dentesPendentesPlano={itensPendentes?.map((i) => i.numeroDente) ?? []}
                />
              </Stack>
            </TabPanel>
          )}

          {/* ── Aba Histórico ── */}
          {hasClinicoAccess && (
            <TabPanel value={tab} index={2}>
              <HistoricoOdontogramaTab
                pacienteId={paciente.id}
                denteFiltro={denteFiltroHistorico}
                onClearFiltro={() => setDenteFiltroHistorico(null)}
                onCriarPlano={() => {
                  if (denteFiltroHistorico) setDenteParaPlano(denteFiltroHistorico);
                  setPlanoDrawerOpen(true);
                }}
              />
            </TabPanel>
          )}

          {/* ── Aba Plano de tratamento ── */}
          {hasClinicoAccess && (
            <TabPanel value={tab} index={3}>
              <PlanoTratamentoTab
                pacienteId={paciente.id}
                onNovo={() => setPlanoDrawerOpen(true)}
              />
            </TabPanel>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog de atualizar dentes (múltiplos) ── */}
      <Dialog open={drawerAberto} onClose={() => { setDrawerAberto(false); resetDente(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Atualizar dente{selectedDentes.length > 1 ? 's' : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedDentes.join(', ')}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => { setDrawerAberto(false); resetDente(); }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="situacaoAtual"
              control={controlDente}
              render={({ field }) => (
                <TextField {...field} select label="Situação identificada *" error={!!errorsDente.situacaoAtual} helperText={errorsDente.situacaoAtual?.message} fullWidth size="small">
                  {Object.entries(SITUACAO_DENTE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="observacao"
              control={controlDente}
              render={({ field }) => (
                <TextField {...field} label="Observação" multiline minRows={2} fullWidth size="small" inputProps={{ maxLength: 500 }} />
              )}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" size="small" onClick={() => { setDrawerAberto(false); resetDente(); }}>Cancelar</Button>
          <Button
            variant="contained"
            size="small"
            disabled={updateOdontograma.isPending || selectedDentes.length === 0}
            onClick={handleSubmitDente(handleConfirmarDrawer)}
          >
            {updateOdontograma.isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Plano Drawer ── */}
      <PlanoTratamentoDrawer
        open={planoDrawerOpen}
        pacienteId={paciente.id}
        dentistaId={currentDentistaId}
        selectedDentes={denteParaPlano != null ? [denteParaPlano] : undefined}
        useDialog
        onClose={() => { setPlanoDrawerOpen(false); setDenteParaPlano(null); }}
        onSuccess={() => { setPlanoDrawerOpen(false); setDenteParaPlano(null); }}
        onError={() => undefined}
      />

      {/* ── Snack ── */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
