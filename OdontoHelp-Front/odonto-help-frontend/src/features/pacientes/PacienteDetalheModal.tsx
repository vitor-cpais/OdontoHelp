// src/features/pacientes/PacienteDetalheModal.tsx
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Box, Tabs, Tab, Typography, IconButton,
  Divider, Chip, Button, TextField, MenuItem, Snackbar, Alert,
  Stack,
} from '@mui/material';
import { Close, PersonOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { useUpdateOdontograma } from '../odontograma/useOdontograma';
import { SITUACAO_DENTE_LABELS, FACE_DENTE_LABELS } from '../atendimentos/types';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';
import { useAtendimentosPorPaciente } from '../atendimentos/useAtendimentos';
import HistoricoOdontogramaTab from '../odontograma/HistoricoOdontogramaTab';
import PlanoTratamentoTab from '../planoTratamento/PlanoTratamentoTab';
import PlanoTratamentoDrawer from '../planoTratamento/PlanoTratamentoDrawer';
import type { Paciente } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2.5 }}>
      {value === index && children}
    </Box>
  );
}

interface Props {
  open: boolean;
  paciente: Paciente | null;
  onClose: () => void;
}

export default function PacienteDetalheModal({ open, paciente, onClose }: Props) {
  const perfil = useAuthStore((s) => s.usuario?.perfil);
  const currentDentistaId = useAuthStore((s) => s.usuario?.dentistaId ?? undefined);
  const hasClinicoAccess = perfil === 'ADMIN' || perfil === 'DENTISTA';
  const [tab, setTab] = useState(0);
  const [selectedDentes, setSelectedDentes] = useState<number[]>([]);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [denteFiltroHistorico, setDenteFiltroHistorico] = useState<number | null>(null);
  const [planoDrawerOpen, setPlanoDrawerOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const updateOdontograma = useUpdateOdontograma(paciente?.id ?? null);
  const navigate = useNavigate();
  const { data: atendimentosData } = useAtendimentosPorPaciente(paciente?.id ?? null, 0);
  const atendimentoAtivo = atendimentosData?.content?.find((a: any) => a.status === 'EM_ANDAMENTO');

  const schemaDente = z.object({
    situacaoAtual: z.string().min(1, 'Situação obrigatória'),
    face: z.string().optional().default(''),
    observacao: z.string().optional().default(''),
  });
  type FormDente = z.infer<typeof schemaDente>;

  const {
    control: controlDente,
    handleSubmit: handleSubmitDente,
    reset: resetDente,
    formState: { errors: errorsDente },
  } = useForm<FormDente>({
    resolver: zodResolver(schemaDente),
    defaultValues: { situacaoAtual: '', face: '', observacao: '' },
  });

  useEffect(() => {
    if (!hasClinicoAccess && tab !== 0) {
      setTab(0);
    }
  }, [hasClinicoAccess, tab]);

  useEffect(() => {
    if (!open) {
      setTab(0);
      setSelectedDentes([]);
      setDrawerAberto(false);
      setDenteFiltroHistorico(null);
      resetDente();
    }
  }, [open]);

  if (!paciente) return null;

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

  const handleCriarPlano = (numeroDente?: number) => {
    if (numeroDente != null) {
      setSelectedDentes([numeroDente]);
    }
    setPlanoDrawerOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, minHeight: '75vh' } }}
    >
      <DialogTitle sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            backgroundColor: '#E1F5EE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PersonOutlined sx={{ fontSize: 20, color: '#0F6E56' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {paciente.nome}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.disabled">
                CPF: {paciente.cpf}
              </Typography>
              <Chip
                label={paciente.isAtivo ? 'Ativo' : 'Inativo'}
                size="small"
                sx={{
                  fontSize: '0.65rem', height: 18,
                  backgroundColor: paciente.isAtivo ? '#E1F5EE' : '#F5F5F5',
                  color: paciente.isAtivo ? '#0F6E56' : '#888',
                  border: '1px solid',
                  borderColor: paciente.isAtivo ? '#9FE1CB' : '#DDD',
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '0.5px solid',
            borderColor: 'divider',
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, fontSize: '0.82rem', textTransform: 'none' },
          }}
        >
          <Tab label="Dados" />
          {hasClinicoAccess && <Tab label="Odontograma" />}
          {hasClinicoAccess && <Tab label="Histórico" />}
          {hasClinicoAccess && <Tab label="Plano de tratamento" />}
        </Tabs>

        {/* Aba Dados */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              { label: 'Email', value: paciente.email },
              { label: 'Telefone', value: paciente.telefone ?? '—' },
              { label: 'Data de nascimento', value: paciente.dataNascimento
                ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')
                : '—' },
              { label: 'CPF', value: paciente.cpf },
            ].map(({ label, value }) => (
              <Box key={label}>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {value}
                </Typography>
              </Box>
            ))}

            {paciente.observacoesMedicas && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                  Observações médicas
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {paciente.observacoesMedicas}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {hasClinicoAccess && (
          <TabPanel value={tab} index={1}>
            <Stack spacing={2}>
              {selectedDentes.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                    onClick={() => setDrawerAberto(true)}
                    sx={{ ml: 'auto' }}
                  >
                    Adicionar procedimento
                  </Button>
                </Box>
              )}
              {selectedDentes.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  Clique em um dente para selecionar. Selecione um ou mais dentes e clique em "Adicionar procedimento".
                </Typography>
              )}
              {atendimentoAtivo && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate(`/atendimentos/${atendimentoAtivo.id}`)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Ir para atendimento #{atendimentoAtivo.id}
                </Button>
              )}
              <OdontogramaVisual
                pacienteId={paciente.id}
                selectedDentes={selectedDentes}
                onDenteClick={handleDenteClick}
              />
            </Stack>
          </TabPanel>
        )}

        {hasClinicoAccess && (
          <TabPanel value={tab} index={2}>
            <HistoricoOdontogramaTab
              pacienteId={paciente.id}
              denteFiltro={denteFiltroHistorico ?? undefined}
              onClearFiltro={() => setDenteFiltroHistorico(null)}
              onCriarPlano={() => handleCriarPlano(denteFiltroHistorico ?? undefined)}
            />
          </TabPanel>
        )}

        {hasClinicoAccess && (
          <TabPanel value={tab} index={3}>
            <PlanoTratamentoTab pacienteId={paciente.id} useDialogForDrawer />
          </TabPanel>
        )}
      </DialogContent>

      <Dialog
        open={drawerAberto}
        onClose={() => { setDrawerAberto(false); setSelectedDentes([]); resetDente(); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Adicionar procedimento
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dente{selectedDentes.length > 1 ? 's' : ''}: {selectedDentes.join(', ')}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => { setDrawerAberto(false); setSelectedDentes([]); resetDente(); }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <Controller
              name="situacaoAtual"
              control={controlDente}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Situação identificada *"
                  error={!!errorsDente.situacaoAtual}
                  helperText={errorsDente.situacaoAtual?.message}
                  fullWidth
                >
                  {Object.entries(SITUACAO_DENTE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="face"
              control={controlDente}
              render={({ field }) => (
                <TextField {...field} select label="Face" fullWidth>
                  <MenuItem value="">—</MenuItem>
                  {Object.entries(FACE_DENTE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="observacao"
              control={controlDente}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observação"
                  multiline
                  minRows={2}
                  fullWidth
                  inputProps={{ maxLength: 500 }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setDrawerAberto(false); setSelectedDentes([]); resetDente(); }}
          >
            Cancelar
          </Button>
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

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      <PlanoTratamentoDrawer
        open={planoDrawerOpen}
        pacienteId={paciente.id}
        dentistaId={currentDentistaId}
        useDialog
        onClose={() => setPlanoDrawerOpen(false)}
        onSuccess={() => setPlanoDrawerOpen(false)}
        onError={() => undefined}
      />
    </Dialog>
  );
}
