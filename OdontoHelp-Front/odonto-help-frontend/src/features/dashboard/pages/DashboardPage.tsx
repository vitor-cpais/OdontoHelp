import { useState } from 'react';
import {
  Box, Button, Grid, Typography, Paper, Skeleton, TextField,
  Stack, Divider, IconButton, Tooltip, Chip,
} from '@mui/material';
import {
  CalendarMonthOutlined, PeopleOutlined,
  MedicalServicesOutlined, EventNoteOutlined, AddOutlined, ArrowForwardOutlined,
  WarningAmberOutlined, EmailOutlined, WhatsApp, EventAvailableOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useDashboardResumo, useAgendamentosPorStatus,useProximosHoje } from '../useDashboard';
import { STATUS_COLORS, STATUS_LABELS } from '../../../domains/agendamentos';
import type { StatusConsulta } from '../../../domains/agendamentos';
import { useAgendamentoDrawerStore } from '../../agendamentos/agendamentoStore';
import AgendamentoStatusChip from '../../agendamentos/AgendamentoStatusChip';
import { useCurrentPerfil } from '../../../shared/hooks/useCurrentPerfil';
import { canFilterByDentista } from '../../../permissions/roles';
import { EmptyState } from '../../../design-system/components';
import { useDentistas } from '../../dentistas/useDentistas';
import DentistaFiltroAutocomplete from '../../../shared/components/DentistaFiltroAutocomplete';
import { useInadimplentesComConsultaHoje, useEnviarLembreteEmail } from '../../financeiro/useFinanceiro';
import { buildWhatsAppCobrancaUrl, formatLembreteCobrancaMessage } from '../../financeiro/cobrancaNotificacao';
import { fmtMoeda } from '../../financeiro/financeiroLabels';
import { getApiErrorMessage } from '../../../shared/lib/axios';

const fmt = (d: Date) => d.toISOString().slice(0, 10);

const hoje = new Date();
const ha30dias = new Date(hoje);
ha30dias.setDate(ha30dias.getDate() - 30);

interface CardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading: boolean;
}

function MetricCard({ label, value, icon, color, bgColor, loading }: CardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        minHeight: 132,
        borderRadius: 3,
        border: '1px solid rgba(15,110,86,0.08)',
        boxShadow: '0 10px 30px rgba(22, 43, 35, 0.05)',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={36} />
          ) : (
            <Typography sx={{ fontSize: '2.35rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1, mt: 0.75 }}>
              {value ?? 0}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            Atualizado em tempo real
          </Typography>
        </Box>
        <Box sx={{
          width: 48, height: 48, borderRadius: '16px',
          backgroundColor: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dataInicio, setDataInicio] = useState(fmt(ha30dias));
  const [dataFim, setDataFim] = useState(fmt(hoje));
  const [dentistaFiltroId, setDentistaFiltroId] = useState<number | ''>('');

  const { openNew, openView } = useAgendamentoDrawerStore();
  const perfil = useCurrentPerfil();
  const isDentista = perfil === 'DENTISTA';
  const canFiltrarDentista = canFilterByDentista(perfil);
  const dentistaId = canFiltrarDentista && dentistaFiltroId ? dentistaFiltroId : undefined;
  const { data: dentistasData } = useDentistas(
    { page: 0, size: 100, isAtivo: true },
    { staleTime: 1000 * 60, enabled: canFiltrarDentista }
  );
  const dentistas = dentistasData?.content ?? [];
  const dentistaSelecionado = dentistas.find((d) => d.id === dentistaFiltroId) ?? null;

  const { data: resumo, isLoading: loadingResumo } = useDashboardResumo(dentistaId);
  const { data: porStatus, isLoading: loadingStatus } = useAgendamentosPorStatus(dataInicio, dataFim, dentistaId);
  const { data: proximos, isLoading: loadingProximos } = useProximosHoje(dentistaId);
  const { data: inadimplentesHoje, isLoading: loadingInadimplentesHoje } = useInadimplentesComConsultaHoje();
  const enviarEmail = useEnviarLembreteEmail();
  const saudacao = isDentista ? 'Sua agenda clínica do dia' : 'Cockpit operacional da clínica';

  const pieData = (porStatus ?? [])
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: STATUS_LABELS[d.status],
      value: Number(d.total),
      status: d.status,
      color: STATUS_COLORS[d.status].text,
      fill: STATUS_COLORS[d.status].bg,
      stroke: STATUS_COLORS[d.status].border,
    }));

  const cards = [
    {
      label: isDentista ? 'Meus agendamentos hoje' : 'Agendamentos hoje',
      value: resumo?.agendamentosHoje,
      icon: <CalendarMonthOutlined sx={{ fontSize: 22 }} />,
      color: '#854F0B',
      bgColor: '#FAEEDA',
    },
    {
      label: isDentista ? 'Meus agendamentos no mês' : 'Agendamentos no mês',
      value: resumo?.agendamentosMes,
      icon: <EventNoteOutlined sx={{ fontSize: 22 }} />,
      color: '#185FA5',
      bgColor: '#E6F1FB',
    },
    {
      label: isDentista ? 'Meus pacientes' : 'Pacientes ativos',
      value: resumo?.pacientesAtivos,
      icon: <PeopleOutlined sx={{ fontSize: 22 }} />,
      color: '#0F6E56',
      bgColor: '#E1F5EE',
    },
    {
      label: isDentista ? 'Meu perfil clínico' : 'Dentistas ativos',
      value: resumo?.dentistasAtivos,
      icon: <MedicalServicesOutlined sx={{ fontSize: 22 }} />,
      color: '#5F5E5A',
      bgColor: '#F1EFE8',
    },
  ];

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          color: '#fff',
          background:
            'radial-gradient(circle at top right, rgba(29,158,117,0.95), transparent 34%), linear-gradient(135deg, #063F35 0%, #0F6E56 58%, #0B4F41 100%)',
          boxShadow: '0 22px 60px rgba(8, 80, 65, 0.22)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -70,
            bottom: -90,
            width: 240,
            height: 240,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.72)' }}>
              Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </Typography>
            <Typography variant="h1" sx={{ mt: 0.5, color: '#fff', maxWidth: 660 }}>
              {saudacao}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255,255,255,0.78)', maxWidth: 620 }}>
              Acompanhe volume, status e próximos horários sem sair do dashboard.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ position: 'relative' }}>
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => {
                openNew();
                navigate('/agendamentos');
              }}
              sx={{ borderRadius: 999, px: 2.25, backgroundColor: '#fff', color: 'primary.main', '&:hover': { backgroundColor: '#F7F6F2' } }}
            >
              Novo agendamento
            </Button>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardOutlined />}
              onClick={() => navigate('/agendamentos')}
              sx={{ borderRadius: 999, px: 2.25, color: '#fff', borderColor: 'rgba(255,255,255,0.55)', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              Ver agenda
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {canFiltrarDentista && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                Escopo do dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veja a clínica inteira ou filtre por um dentista específico.
              </Typography>
            </Box>
            <DentistaFiltroAutocomplete
              dentistas={dentistas}
              value={dentistaSelecionado}
              onChange={setDentistaFiltroId}
              width={{ xs: '100%', sm: 280 }}
            />
          </Stack>
        </Paper>
      )}

      {/* Cards */}
      <Grid container spacing={2.25} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <MetricCard {...c} loading={loadingResumo} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.25}>
        {/* Gráfico pizza */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.05)', height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Agendamentos por status
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField size="small" type="date" label="De" value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 140, '& .MuiInputBase-input': { fontSize: '0.78rem' } }} />
                <TextField size="small" type="date" label="Até" value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 140, '& .MuiInputBase-input': { fontSize: '0.78rem' } }} />
              </Stack>
            </Stack>

            {loadingStatus ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 3 }} />
            ) : pieData.length === 0 ? (
              <EmptyState title="Nenhum dado no período" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke={entry.stroke} strokeWidth={1} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '0.5px solid #D3D1C7' }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value, entry) => {
                        const total = pieData.find((item) => item.name === value)?.value ?? entry.payload?.value;
                        return (
                          <span style={{ fontSize: '0.78rem', color: '#5F5E5A' }}>
                            {total} {value}
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </Paper>
        </Grid>

        {/* Próximos agendamentos hoje */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.05)', height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Próximos agendamentos
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Hoje, em ordem de horário
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/agendamentos')}>
                Agenda
              </Button>
            </Stack>

            {loadingProximos ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            ) : !proximos || proximos.length === 0 ? (
              <EmptyState
                title="Nenhum agendamento para hoje"
                description="Use a ação rápida para registrar o próximo atendimento."
                actionLabel="Novo agendamento"
                onAction={() => {
                  openNew();
                  navigate('/agendamentos');
                }}
              />
            ) : (
              <Stack spacing={0} divider={<Divider />}>
                {proximos.map((a) => (
                  <Box key={a.id} onClick={() => {
                    openView(a);
                    navigate('/agendamentos');
                  }} sx={{
                    py: 1.5, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 1.5,
                    '&:hover': { backgroundColor: 'background.default', mx: -2.5, px: 2.5 },
                  }}>
                    <Box sx={{
                      minWidth: 48, textAlign: 'center',
                      backgroundColor: 'background.default',
                      borderRadius: 1, py: 0.5, px: 1,
                    }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary', lineHeight: 1 }}>
                        {new Date(a.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }} noWrap>
                        {a.pacienteNome}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" noWrap>
                        {a.dentistaNome}
                      </Typography>
                    </Box>
                    <AgendamentoStatusChip status={a.status} />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Inadimplentes com consulta hoje */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.05)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningAmberOutlined sx={{ color: '#C0392B', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    Inadimplentes com consulta hoje
                  </Typography>
                  {!loadingInadimplentesHoje && (inadimplentesHoje?.length ?? 0) > 0 && (
                    <Chip size="small" color="warning" label={inadimplentesHoje?.length} />
                  )}
                </Stack>
                <Typography variant="caption" color="text.disabled">
                  Pacientes com parcela vencida e agendamento confirmado para hoje
                </Typography>
              </Box>
              <Button size="small" endIcon={<ArrowForwardOutlined />} onClick={() => navigate('/financeiro')}>
                Financeiro
              </Button>
            </Stack>

            {loadingInadimplentesHoje ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            ) : !inadimplentesHoje || inadimplentesHoje.length === 0 ? (
              <EmptyState title="Nenhum inadimplente com consulta hoje" description="Situação financeira alinhada com a agenda do dia." />
            ) : (
              <Stack spacing={0} divider={<Divider />}>
                {inadimplentesHoje.map((p) => (
                  <Box key={p.id} sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {p.pacienteNome ?? 'Paciente'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" noWrap>
                        {p.cobrancaDescricao ?? `Cobrança #${p.cobrancaId}`} · Saldo {fmtMoeda(p.saldo)}
                        {p.horaConsulta && ` · Consulta ${p.horaConsulta}`}
                        {p.dentistaNome && ` · ${p.dentistaNome}`}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      icon={<EventAvailableOutlined sx={{ fontSize: 14 }} />}
                      label="Hoje"
                      color="warning"
                      variant="outlined"
                    />
                    <Tooltip title="Enviar lembrete por e-mail">
                      <span>
                        <IconButton
                          size="small"
                          disabled={enviarEmail.isPending}
                          onClick={async () => {
                            try {
                              await enviarEmail.mutateAsync({ parcelaId: p.id, pacienteId: p.pacienteIdExterno });
                            } catch (e) {
                              console.error(getApiErrorMessage(e, 'Erro ao enviar lembrete'));
                            }
                          }}
                        >
                          <EmailOutlined fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!p.pacienteTelefone}
                          onClick={() => {
                            if (!p.pacienteTelefone) return;
                            const url = buildWhatsAppCobrancaUrl(p.pacienteTelefone, formatLembreteCobrancaMessage(p));
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <WhatsApp fontSize="small" sx={{ color: '#25D366' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button size="small" onClick={() => navigate('/financeiro')}>Ver</Button>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
