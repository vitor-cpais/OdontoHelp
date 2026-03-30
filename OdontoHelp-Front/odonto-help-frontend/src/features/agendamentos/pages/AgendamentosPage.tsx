import { useState, useRef, useCallback } from 'react';
import {
  Box, Button, TextField, MenuItem, Stack, Typography,
  ToggleButton, ToggleButtonGroup, Snackbar, Alert,
  InputAdornment, TablePagination,
} from '@mui/material';
import { AddOutlined, CalendarMonthOutlined, TableRowsOutlined, SearchOutlined } from '@mui/icons-material';
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
import { useDebounce } from '../../../shared/hooks/useDebounce';

type ViewMode = 'calendario' | 'lista';
type CalView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const hoje = new Date();
const daqui7 = new Date(hoje);
daqui7.setDate(daqui7.getDate() + 7);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

const STATUS_FILTRO: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO', 'CONCLUIDO', 'FALTA'];

export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendario');
  const [calView, setCalView] = useState<CalView>('timeGridWeek');
  const [statusFiltro, setStatusFiltro] = useState<StatusConsulta | ''>('');
  const [dataInicio, setDataInicio] = useState(fmt(hoje));
  const [dataFim, setDataFim] = useState(fmt(daqui7));
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const calRef = useRef<FullCalendar>(null);
  const { openNew, openView } = useAgendamentoDrawerStore();
  const nomeBusca = useDebounce(busca, 400);

  const params = {
    page: viewMode === 'lista' ? page : 0,
    size: viewMode === 'lista' ? 10 : 200,
    dataInicio: viewMode === 'lista' ? (dataInicio || undefined) : undefined,
    dataFim: viewMode === 'lista' ? (dataFim || undefined) : undefined,
    status: statusFiltro || undefined,
    nome: viewMode === 'lista' ? (nomeBusca || undefined) : undefined,
  };

  const { data } = useAgendamentos(params);

  const agendamentos = (data?.content ?? []).filter((a) => {
    if (viewMode === 'calendario' && !statusFiltro && a.status === 'CANCELADO') return false;
    return true;
  });

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

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
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>

        <ToggleButtonGroup value={viewMode} exclusive size="small"
          onChange={(_, v) => v && setViewMode(v)}>
          <ToggleButton value="calendario" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <CalendarMonthOutlined sx={{ fontSize: 16 }} /> Calendário
          </ToggleButton>
          <ToggleButton value="lista" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <TableRowsOutlined sx={{ fontSize: 16 }} /> Lista
          </ToggleButton>
        </ToggleButtonGroup>

        {viewMode === 'calendario' && (
          <ToggleButtonGroup value={calView} exclusive size="small"
            onChange={(_, v) => v && handleCalViewChange(v)}>
            <ToggleButton value="timeGridDay" sx={{ fontSize: '0.75rem', px: 1.25 }}>Dia</ToggleButton>
            <ToggleButton value="timeGridWeek" sx={{ fontSize: '0.75rem', px: 1.25 }}>Semana</ToggleButton>
            <ToggleButton value="dayGridMonth" sx={{ fontSize: '0.75rem', px: 1.25 }}>Mês</ToggleButton>
            <ToggleButton value="listWeek" sx={{ fontSize: '0.75rem', px: 1.25 }}>Agenda</ToggleButton>
          </ToggleButtonGroup>
        )}

        {viewMode === 'lista' && (
          <TextField
            placeholder="Buscar paciente ou dentista..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(0); }}
            size="small"
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        <TextField select size="small" value={statusFiltro} label="Status"
          onChange={(e) => { setStatusFiltro(e.target.value as StatusConsulta | ''); setPage(0); }}
          sx={{ width: 150 }}>
          <MenuItem value="">Todos</MenuItem>
          {STATUS_FILTRO.map((s) => (
            <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
          ))}
          {viewMode === 'lista' && (
            <MenuItem value="CANCELADO">{STATUS_LABELS['CANCELADO']}</MenuItem>
          )}
        </TextField>

        {viewMode === 'lista' && (
          <>
            <TextField size="small" type="date" label="De" value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
            <TextField size="small" type="date" label="Até" value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          </>
        )}

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
            eventClick={(info) => openView(info.event.extendedProps.agendamento)}
            select={(info) => openNew(info.startStr, info.endStr)}
            selectable
            selectMirror
          />
        </Box>
      )}

      {/* Lista */}
      {viewMode === 'lista' && (
        <Box sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', backgroundColor: 'background.paper' }}>
          {agendamentos.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">Nenhum agendamento encontrado</Typography>
            </Box>
          ) : (
            agendamentos.map((a, i) => (
              <Box key={a.id} onClick={() => openView(a)} sx={{
                p: 2, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2,
                borderBottom: i < agendamentos.length - 1 ? '0.5px solid' : 'none',
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'background.default' },
              }}>
                <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 1, backgroundColor: STATUS_COLORS[a.status].border, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>{a.pacienteNome}</Typography>
                  <Typography variant="caption" color="text.disabled">{a.dentistaNome}</Typography>
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
            ))
          )}
          <Box sx={{ borderTop: '0.5px solid', borderColor: 'divider' }}>
            <TablePagination
              component="div"
              count={-1}
              page={page}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              onPageChange={(_, p) => setPage(p)}
              labelDisplayedRows={({ from, to }) => `${from}–${to}`}
              nextIconButtonProps={{ disabled: data?.last ?? true }}
              sx={{ fontSize: '0.8rem' }}
            />
          </Box>
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
