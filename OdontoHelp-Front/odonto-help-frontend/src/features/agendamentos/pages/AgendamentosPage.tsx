import { useState, useRef, useCallback } from 'react';
import {
  Box, Button, TextField, MenuItem, Stack, Typography,
  ToggleButton, ToggleButtonGroup, Snackbar, Alert, Chip,
} from '@mui/material';
import {
  AddOutlined, CalendarMonthOutlined, TableRowsOutlined,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useAgendamentos } from '../useAgendamentos';
import { useAgendamentoDrawerStore } from '../agendamentoStore';
import AgendamentoDrawer from '../AgendamentoDrawer';
import AgendamentoStatusChip from '../AgendamentoStatusChip';
import { STATUS_COLORS, STATUS_LABELS } from '../types';
import type { StatusConsulta } from '../types';

type ViewMode = 'calendario' | 'lista';
type CalView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const hoje = new Date();
const daqui7 = new Date(hoje);
daqui7.setDate(daqui7.getDate() + 7);

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendario');
  const [calView, setCalView] = useState<CalView>('timeGridWeek');
  const [statusFiltro, setStatusFiltro] = useState<StatusConsulta | ''>('');
  const [dataInicio, setDataInicio] = useState(fmt(hoje));
  const [dataFim, setDataFim] = useState(fmt(daqui7));
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });
  const calRef = useRef<FullCalendar>(null);

  const { openNew, openEdit } = useAgendamentoDrawerStore();

  const params = {
    page: 0,
    size: 200,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    status: statusFiltro || undefined,
  };

  const { data } = useAgendamentos(params);
  const agendamentos = data?.content ?? [];

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  // Converte agendamentos para eventos do FullCalendar
  const events = agendamentos.map((a) => ({
    id: String(a.id),
    title: `${a.pacienteNome} · ${a.dentistaNome}`,
    start: a.dataInicio,
    end: a.dataFim,
    backgroundColor: STATUS_COLORS[a.status].bg,
    borderColor: STATUS_COLORS[a.status].border,
    textColor: STATUS_COLORS[a.status].text,
    extendedProps: { agendamento: a },
  }));

  const handleCalViewChange = (view: CalView) => {
    setCalView(view);
    calRef.current?.getApi().changeView(view);
  };

  return (
    <Box>
      {/* Toolbar */}
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="calendario" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <CalendarMonthOutlined sx={{ fontSize: 16 }} /> Calendário
          </ToggleButton>
          <ToggleButton value="lista" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <TableRowsOutlined sx={{ fontSize: 16 }} /> Lista
          </ToggleButton>
        </ToggleButtonGroup>

        {viewMode === 'calendario' && (
          <ToggleButtonGroup value={calView} exclusive onChange={(_, v) => v && handleCalViewChange(v)} size="small">
            <ToggleButton value="timeGridDay" sx={{ fontSize: '0.75rem', px: 1.25 }}>Dia</ToggleButton>
            <ToggleButton value="timeGridWeek" sx={{ fontSize: '0.75rem', px: 1.25 }}>Semana</ToggleButton>
            <ToggleButton value="dayGridMonth" sx={{ fontSize: '0.75rem', px: 1.25 }}>Mês</ToggleButton>
            <ToggleButton value="listWeek" sx={{ fontSize: '0.75rem', px: 1.25 }}>Agenda</ToggleButton>
          </ToggleButtonGroup>
        )}

        <TextField select size="small" value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value as StatusConsulta | '')}
          sx={{ width: 150 }} label="Status">
          <MenuItem value="">Todos</MenuItem>
          {(['AGENDADO', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'FALTA'] as StatusConsulta[]).map((s) => (
            <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
          ))}
        </TextField>

        <TextField size="small" type="date" label="De" value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />

        <TextField size="small" type="date" label="Até" value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />

        <Box sx={{ flex: 1 }} />

        <Button variant="contained" startIcon={<AddOutlined sx={{ fontSize: 17 }} />}
          onClick={() => openNew()} size="small" sx={{ height: 36 }}>
          Novo agendamento
        </Button>
      </Stack>

      {/* Calendário */}
      {viewMode === 'calendario' && (
        <Box sx={{
          '& .fc': { fontFamily: 'inherit', fontSize: '0.82rem' },
          '& .fc-button': { textTransform: 'none', fontFamily: 'inherit' },
          '& .fc-event': { cursor: 'pointer', borderRadius: '4px', border: '1px solid' },
          '& .fc-daygrid-event': { fontSize: '0.75rem' },
          '& .fc-timegrid-event': { fontSize: '0.75rem' },
          '& .fc-col-header-cell': { fontWeight: 500, color: '#5F5E5A', fontSize: '0.78rem' },
        }}>
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={calView}
            locale={ptBrLocale}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            events={events}
            height="calc(100vh - 220px)"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            eventClick={(info) => {
              const a = info.event.extendedProps.agendamento;
              openEdit(a);
            }}
            dateClick={(info) => openNew(info.dateStr)}
            selectable
            selectMirror
          />
        </Box>
      )}

      {/* Lista */}
      {viewMode === 'lista' && (
        <Box>
          {agendamentos.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">Nenhum agendamento encontrado</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {agendamentos.map((a) => (
                <Box
                  key={a.id}
                  onClick={() => openEdit(a)}
                  sx={{
                    p: 2, borderRadius: 2, border: '0.5px solid', borderColor: 'divider',
                    backgroundColor: 'background.paper', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 2,
                    '&:hover': { backgroundColor: 'background.default' },
                  }}
                >
                  <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 1, backgroundColor: STATUS_COLORS[a.status].border, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {a.pacienteNome}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {a.dentistaNome}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {new Date(a.dataInicio).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(a.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(a.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <AgendamentoStatusChip status={a.status} />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <AgendamentoDrawer
        onSuccess={(msg) => showToast(msg, 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
