import { useState } from 'react';
import {
  Box, Grid, Typography, Paper, Skeleton, TextField,
  Stack, Divider, Chip,
} from '@mui/material';
import {
  CalendarMonthOutlined, PeopleOutlined,
  MedicalServicesOutlined, EventNoteOutlined,
} from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useDashboardResumo, useAgendamentosPorStatus,useProximosHoje } from '../useDashboard';
import { STATUS_COLORS, STATUS_LABELS } from '../../agendamentos/types';
import type { StatusConsulta } from '../../agendamentos/types';
import { useAgendamentoDrawerStore } from '../../agendamentos/agendamentoStore';
import AgendamentoStatusChip from '../../agendamentos/AgendamentoStatusChip';

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
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, border: '0.5px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={36} />
          ) : (
            <Typography sx={{ fontSize: '2rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.2, mt: 0.5 }}>
              {value ?? 0}
            </Typography>
          )}
        </Box>
        <Box sx={{
          width: 44, height: 44, borderRadius: '10px',
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
  const [dataInicio, setDataInicio] = useState(fmt(ha30dias));
  const [dataFim, setDataFim] = useState(fmt(hoje));

  const { data: resumo, isLoading: loadingResumo } = useDashboardResumo();
  const { data: porStatus, isLoading: loadingStatus } = useAgendamentosPorStatus(dataInicio, dataFim);
  const { data: proximos, isLoading: loadingProximos } = useProximosHoje();
  const { openView } = useAgendamentoDrawerStore();

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
      label: 'Agendamentos hoje',
      value: resumo?.agendamentosHoje,
      icon: <CalendarMonthOutlined sx={{ fontSize: 22 }} />,
      color: '#854F0B',
      bgColor: '#FAEEDA',
    },
    {
      label: 'Agendamentos no mês',
      value: resumo?.agendamentosMes,
      icon: <EventNoteOutlined sx={{ fontSize: 22 }} />,
      color: '#185FA5',
      bgColor: '#E6F1FB',
    },
    {
      label: 'Pacientes ativos',
      value: resumo?.pacientesAtivos,
      icon: <PeopleOutlined sx={{ fontSize: 22 }} />,
      color: '#0F6E56',
      bgColor: '#E1F5EE',
    },
    {
      label: 'Dentistas ativos',
      value: resumo?.dentistasAtivos,
      icon: <MedicalServicesOutlined sx={{ fontSize: 22 }} />,
      color: '#5F5E5A',
      bgColor: '#F1EFE8',
    },
  ];

  return (
    <Box>
      {/* Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <MetricCard {...c} loading={loadingResumo} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Gráfico pizza */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, border: '0.5px solid', borderColor: 'divider', height: '100%' }}>
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
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.disabled">Nenhum dado no período</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke={entry.stroke} strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '0.5px solid #D3D1C7' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: '0.78rem', color: '#5F5E5A' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Próximos agendamentos hoje */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, border: '0.5px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 500, mb: 2 }}>
              Próximos agendamentos — hoje
            </Typography>

            {loadingProximos ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={52} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            ) : !proximos || proximos.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.disabled">Nenhum agendamento para hoje</Typography>
              </Box>
            ) : (
              <Stack spacing={0} divider={<Divider />}>
                {proximos.map((a: any) => (
                  <Box key={a.id} onClick={() => openView(a)} sx={{
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
      </Grid>
    </Box>
  );
}
