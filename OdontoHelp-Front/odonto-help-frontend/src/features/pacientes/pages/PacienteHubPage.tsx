import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBackOutlined,
  CalendarMonthOutlined,
  DownloadOutlined,
  EditOutlined,
  HealingOutlined,
  MedicalInformationOutlined,
  PlaylistAddCheckOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '../../../shared/store/authStore';
import { usePaciente } from '../usePacientes';
import { usePacienteDrawerStore } from '../pacienteStore';
import PacienteDrawer from '../PacienteDrawer';
import PacienteAnamneseCard from '../PacienteAnamneseCard';
import PacienteObservacoesListaCard from '../PacienteObservacoesListaCard';
import { useAtendimentosPorPaciente } from '../../atendimentos/useAtendimentos';
import { useItensPlanoPendentes } from '../../planoTratamento/usePlanoTratamento';
import OdontogramaVisual from '../../odontograma/OdontogramaVisual';
import HistoricoOdontogramaTab from '../../odontograma/HistoricoOdontogramaTab';
import PlanoTratamentoTab from '../../planoTratamento/PlanoTratamentoTab';
import PacienteDocumentosTab from '../../arquivos/PacienteDocumentosTab';
import ArquivoBlobImage from '../../arquivos/ArquivoBlobImage';
import { arquivoService } from '../../arquivos/arquivoService';
import { useFotoPrincipal } from '../../arquivos/useArquivos';
import { getApiErrorMessage } from '../../../shared/lib/axios';
import AtendimentoStatusChip from '../../atendimentos/AtendimentoStatusChip';
import IniciarAtendimentoAvulsoDialog from '../../atendimentos/IniciarAtendimentoAvulsoDialog';
import { formatDataFromISO } from '../../../shared/utils/masks';
import DadoSensivel from '../../../shared/components/DadoSensivel';
import { EmptyState, StatusChip } from '../../../design-system/components';

function getIdade(dataNascimento?: string) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade -= 1;
  return idade;
}

export default function PacienteHubPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pacienteId = id ? Number(id) : null;
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });
  const perfil = useAuthStore((s) => s.usuario?.perfil);
  const podeEditarPaciente = perfil === 'ADMIN' || perfil === 'RECEPCAO' || perfil === 'DENTISTA';
  const podeIniciarClinico = perfil === 'ADMIN' || perfil === 'DENTISTA';
  const [avulsoOpen, setAvulsoOpen] = useState(false);
  const openEdit = usePacienteDrawerStore((s) => s.openEdit);

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const { data: paciente, isLoading } = usePaciente(pacienteId);
  const { data: atendimentosData, isLoading: loadingAtendimentos } = useAtendimentosPorPaciente(pacienteId, 0);
  const { data: itensPendentes } = useItensPlanoPendentes(pacienteId);
  const { data: fotoPrincipal } = useFotoPrincipal(pacienteId);

  const atendimentos = atendimentosData?.content ?? [];
  const ultimoAtendimento = atendimentos[0];
  const atendimentoAberto = atendimentos.find((atendimento) => atendimento.status === 'EM_ANDAMENTO');
  const idade = useMemo(() => getIdade(paciente?.dataNascimento), [paciente?.dataNascimento]);

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    );
  }

  if (!paciente) {
    return <Alert severity="error">Paciente não encontrado.</Alert>;
  }

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 2.5,
          borderRadius: 4,
          color: '#fff',
          background:
            'radial-gradient(circle at top right, rgba(29,158,117,0.95), transparent 34%), linear-gradient(135deg, #082F2A 0%, #0F6E56 100%)',
          boxShadow: '0 22px 60px rgba(8,80,65,0.22)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          {fotoPrincipal && (
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid rgba(255,255,255,0.35)',
                  bgcolor: 'rgba(255,255,255,0.12)',
                }}
              >
                <ArquivoBlobImage
                  pacienteId={paciente.id}
                  arquivoId={fotoPrincipal.id}
                  alt={`Foto de ${paciente.nome}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <IconButton
                size="small"
                aria-label="Baixar foto do paciente"
                onClick={async () => {
                  try {
                    await arquivoService.download(fotoPrincipal);
                  } catch (e: unknown) {
                    showToast(getApiErrorMessage(e, 'Erro ao baixar foto'), 'error');
                  }
                }}
                sx={{
                  position: 'absolute',
                  right: -4,
                  bottom: -4,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  color: 'primary.main',
                  width: 28,
                  height: 28,
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <DownloadOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Button
              size="small"
              startIcon={<ArrowBackOutlined />}
              onClick={() => navigate('/pacientes')}
              sx={{ color: 'rgba(255,255,255,0.78)', mb: 1, px: 0 }}
            >
              Voltar para pacientes
            </Button>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Prontuário do paciente
            </Typography>
            <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>
              {paciente.nome}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip label={idade ? `${idade} anos` : 'Idade não informada'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }} />
              <Chip
                label={<DadoSensivel valor={paciente.telefone} tipo="telefone" />}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }}
              />
              {paciente.email && (
                <Chip label={paciente.email} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }} />
              )}
              <StatusChip label={paciente.isAtivo ? 'Ativo' : 'Inativo'} tone={paciente.isAtivo ? 'success' : 'error'} />
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {atendimentoAberto && (
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/atendimentos/${atendimentoAberto.id}`)}
              >
                Atendimento aberto
              </Button>
            )}
            {podeIniciarClinico && !atendimentoAberto && (
              <Button variant="outlined" color="warning" onClick={() => setAvulsoOpen(true)}>
                Atendimento avulso
              </Button>
            )}
            {podeEditarPaciente && (
              <Button variant="contained" startIcon={<EditOutlined />} onClick={() => openEdit(paciente)}>
                Editar cadastro
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <IniciarAtendimentoAvulsoDialog
        open={avulsoOpen}
        onClose={() => setAvulsoOpen(false)}
        pacienteIdPrefill={paciente.id}
        onError={(msg) => showToast(msg, 'error')}
      />

      <Grid container spacing={2.25} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HealingOutlined color="primary" />
              <Box>
                <Typography variant="overline">Último atendimento</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {ultimoAtendimento ? `#${ultimoAtendimento.id}` : 'Nenhum atendimento'}
                </Typography>
              </Box>
            </Stack>
            {ultimoAtendimento && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <AtendimentoStatusChip status={ultimoAtendimento.status} />
                <Button size="small" onClick={() => navigate(`/atendimentos/${ultimoAtendimento.id}`)}>
                  Abrir
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PlaylistAddCheckOutlined color="primary" />
              <Box>
                <Typography variant="overline">Plano pendente</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {(itensPendentes ?? []).length} item{(itensPendentes ?? []).length === 1 ? '' : 's'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarMonthOutlined color="primary" />
              <Box>
                <Typography variant="overline">Histórico clínico</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {atendimentos.length} atendimento{atendimentos.length === 1 ? '' : 's'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label="Resumo" />
          <Tab label="Dados" />
          <Tab label="Odontograma" />
          <Tab label="Plano" />
          <Tab label="Atendimentos" />
          <Tab label="Histórico" />
          <Tab label="Documentos" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && (
            <Grid container spacing={2.25} alignItems="stretch">
              <Grid item xs={12} lg={5}>
                <Stack spacing={2.25} sx={{ height: '100%' }}>
                  <PacienteAnamneseCard
                    pacienteId={paciente.id}
                    anamnese={paciente.observacoesMedicas}
                    canEdit={podeEditarPaciente}
                    onSuccess={(msg) => showToast(msg, 'success')}
                    onError={(msg) => showToast(msg, 'error')}
                  />
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, flex: 1 }}>
                    <Typography variant="h3" sx={{ mb: 1.5 }}>Plano em aberto</Typography>
                    {(itensPendentes ?? []).length === 0 ? (
                      <EmptyState title="Nenhum item pendente" />
                    ) : (
                      <Stack spacing={1}>
                        {(itensPendentes ?? []).slice(0, 5).map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 1,
                              py: 0.75,
                              px: 1,
                              borderRadius: 2,
                              bgcolor: 'background.default',
                            }}
                          >
                            <Typography variant="body2">{item.procedimentoNome}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Dente {item.numeroDente}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Stack>
              </Grid>
              <Grid item xs={12} lg={7}>
                <PacienteObservacoesListaCard
                  pacienteId={paciente.id}
                  canEdit={podeEditarPaciente}
                  onSuccess={(msg) => showToast(msg, 'success')}
                  onError={(msg) => showToast(msg, 'error')}
                />
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Nome" value={paciente.nome} disabled fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <DadoSensivel valor={paciente.cpf} tipo="cpf" variant="textfield" label="CPF" fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="E-mail" value={paciente.email} disabled fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <DadoSensivel valor={paciente.telefone} tipo="telefone" variant="textfield" label="Telefone" fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Nascimento" value={paciente.dataNascimento ? formatDataFromISO(paciente.dataNascimento) : '-'} disabled fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Gênero" value={paciente.genero ?? '-'} disabled fullWidth />
              </Grid>
            </Grid>
          )}

          {tab === 2 && (
            <OdontogramaVisual
              pacienteId={paciente.id}
              dentesPendentesPlano={(itensPendentes ?? []).map((item) => item.numeroDente)}
            />
          )}

          {tab === 3 && <PlanoTratamentoTab pacienteId={paciente.id} />}

          {tab === 4 && (
            loadingAtendimentos ? (
              <Skeleton variant="rounded" height={220} />
            ) : atendimentos.length === 0 ? (
              <EmptyState title="Nenhum atendimento registrado" />
            ) : (
              <Stack spacing={1.25}>
                {atendimentos.map((atendimento) => (
                  <Paper key={atendimento.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Atendimento #{atendimento.id}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(atendimento.horaInicio).toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                      <AtendimentoStatusChip status={atendimento.status} />
                      <Button size="small" onClick={() => navigate(`/atendimentos/${atendimento.id}`)}>Abrir</Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )
          )}

          {tab === 5 && <HistoricoOdontogramaTab pacienteId={paciente.id} />}

          {tab === 6 && (
            <PacienteDocumentosTab
              pacienteId={paciente.id}
              onSuccess={(msg) => showToast(msg, 'success')}
              onError={(msg) => showToast(msg, 'error')}
            />
          )}
        </Box>
      </Paper>

      <PacienteDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
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
