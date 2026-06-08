
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Button, TextField, MenuItem, Stack, Typography, Paper, Chip,
  ToggleButton, ToggleButtonGroup, Snackbar, Alert, IconButton, Tooltip,
  InputAdornment, TablePagination, useMediaQuery, useTheme,
} from '@mui/material';
import { buildTablePaginationCount } from '../../../shared/utils/pagination';
import {
  AddOutlined, CalendarMonthOutlined, TableRowsOutlined, SearchOutlined,
  ChevronLeftOutlined, ChevronRightOutlined,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import type { EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useAgendamentos, STATUS_COLORS, STATUS_LABELS } from '../../../domains/agendamentos';
import type { StatusConsulta, Agendamento } from '../../../domains/agendamentos';
import { useAgendamentoDrawerStore } from '../agendamentoStore';
import AgendamentoDrawer from '../AgendamentoDrawer';
import AgendamentoStatusChip from '../AgendamentoStatusChip';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { EmptyState, StatusChip } from '../../../design-system/components';
import DentistaFiltroAutocomplete from '../../../shared/components/DentistaFiltroAutocomplete';
import { useDentistas } from '../../dentistas/useDentistas';
import { useCurrentPerfil } from '../../../shared/hooks/useCurrentPerfil';
import { canFilterByDentista } from '../../../permissions/roles';

type ViewMode = 'calendario' | 'lista';
type CalView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const CAL_VIEWS: { value: CalView; label: string }[] = [
  { value: 'timeGridDay', label: 'Dia' },
  { value: 'timeGridWeek', label: 'Semana' },
  { value: 'dayGridMonth', label: 'Mês' },
  { value: 'listWeek', label: 'Agenda' },
];

const hoje = new Date();
const daqui7 = new Date(hoje);
daqui7.setDate(daqui7.getDate() + 7);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

const STATUS_FILTRO: StatusConsulta[] = ['AGENDADO', 'CONFIRMADO', 'FALTA'];

const STATUS_KEYS = new Set<string>(Object.keys(STATUS_COLORS));

function isAgendamentoValido(a: Agendamento | null | undefined): a is Agendamento {
  return !!a && typeof a.status === 'string' && STATUS_KEYS.has(a.status);
}

function getAgendamentoFromEvent(arg: EventContentArg): Agendamento | undefined {
  const raw = arg.event.extendedProps?.agendamento;
  return isAgendamentoValido(raw as Agendamento | undefined) ? (raw as Agendamento) : undefined;
}

/** Eventos espelho (seleção/arraste) não têm extendedProps — usar render padrão do FC. */
function renderEventContent(arg: EventContentArg) {
  const agendamento = getAgendamentoFromEvent(arg);
  if (!agendamento) return null;
  return <EventCard arg={arg} agendamento={agendamento} />;
}

function eventDurationMinutes(arg: EventContentArg): number {
  const start = arg.event.start;
  const end = arg.event.end;
  if (!start || !end) return 30;
  return Math.max(15, (end.getTime() - start.getTime()) / 60000);
}

/** Conteudo do evento na grade sem cortar letras: no maximo 2 linhas na semana/dia. */
function EventCard({ arg, agendamento }: { arg: EventContentArg; agendamento: Agendamento }) {
  const cor = STATUS_COLORS[agendamento.status];
  const tooltip = `${arg.timeText} · ${agendamento.pacienteNome} · ${agendamento.dentistaNome}`;
  const isList = arg.view.type === 'listWeek';
  const isMonth = arg.view.type === 'dayGridMonth';
  const isTimeGrid = arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay';

  if (isList) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }} title={tooltip}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cor?.border, flexShrink: 0 }} />
        <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {agendamento.pacienteNome}
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
          · {agendamento.dentistaNome}
        </Typography>
      </Box>
    );
  }

  if (isMonth) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.25, minWidth: 0 }} title={tooltip}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cor?.border, flexShrink: 0 }} />
        <Typography component="span" noWrap sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
          {arg.timeText} {agendamento.pacienteNome}
        </Typography>
      </Box>
    );
  }

  if (isTimeGrid) {
    const mins = eventDurationMinutes(arg);
    const showTime = mins >= 60;

    return (
      <Box
        title={tooltip}
        sx={{
          minWidth: 0,
          px: 0.5,
          py: 0.35,
          lineHeight: 1.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.15,
        }}
      >
        {showTime && (
          <Typography component="div" noWrap sx={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8 }}>
            {arg.timeText}
          </Typography>
        )}
        <Typography component="div" noWrap sx={{ fontSize: '0.74rem', fontWeight: 700 }}>
          {agendamento.pacienteNome}
        </Typography>
        <Typography component="div" noWrap sx={{ fontSize: '0.68rem', opacity: 0.88 }}>
          {agendamento.dentistaNome}
        </Typography>
      </Box>
    );
  }

  return (
    <Box title={tooltip} sx={{ px: 0.5, py: 0.25, lineHeight: 1.25, minWidth: 0 }}>
      <Typography component="div" noWrap sx={{ fontSize: '0.74rem', fontWeight: 700 }}>
        {agendamento.pacienteNome}
      </Typography>
      <Typography component="div" noWrap sx={{ fontSize: '0.68rem', opacity: 0.85 }}>
        {agendamento.dentistaNome}
      </Typography>
    </Box>
  );
}

export default function AgendamentosPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [viewMode, setViewMode] = useState<ViewMode>('calendario');
  const [calView, setCalView] = useState<CalView>('timeGridWeek');
  const [calTitle, setCalTitle] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusConsulta | ''>('');
  const [dataInicio, setDataInicio] = useState(fmt(hoje));
  const [dataFim, setDataFim] = useState(fmt(daqui7));
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [dentistaFiltroId, setDentistaFiltroId] = useState<number | ''>('');
  const [calRangeInicio, setCalRangeInicio] = useState(fmt(hoje));
  const [calRangeFim, setCalRangeFim] = useState(fmt(daqui7));
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const calRef = useRef<FullCalendar>(null);
  const { openNew, openView } = useAgendamentoDrawerStore();
  const nomeBusca = useDebounce(busca, 400);

  const perfil = useCurrentPerfil();
  const canFiltrarDentista = canFilterByDentista(perfil);
  const { data: dentistasData } = useDentistas(
    { page: 0, size: 100, isAtivo: true },
    { staleTime: 1000 * 60, enabled: canFiltrarDentista },
  );
  const dentistas = dentistasData?.content ?? [];
  const dentistaSelecionado = dentistas.find((d) => d.id === dentistaFiltroId) ?? null;
  const dentistaIdParam = canFiltrarDentista && dentistaFiltroId ? dentistaFiltroId : undefined;
  const dentistaPrefill = dentistaIdParam;

  const handleOpenNew = useCallback(
    (dataInicio?: string, dataFim?: string) => {
      openNew(dataInicio, dataFim, dentistaPrefill);
    },
    [openNew, dentistaPrefill],
  );

  useEffect(() => {
    if (isMobile) setViewMode('lista');
  }, [isMobile]);

  const params = {
    page: viewMode === 'lista' ? page : 0,
    size: viewMode === 'lista' ? 10 : 200,
    dataInicio: viewMode === 'lista' ? (dataInicio || undefined) : (calRangeInicio || undefined),
    dataFim: viewMode === 'lista' ? (dataFim || undefined) : (calRangeFim || undefined),
    status: statusFiltro || undefined,
    nome: viewMode === 'lista' ? (nomeBusca || undefined) : undefined,
    dentistaId: dentistaIdParam,
  };

  const { data, isLoading } = useAgendamentos(params);

  const paginationCount = buildTablePaginationCount(data, page, 10);

  const agendamentos = (data?.content ?? []).filter((a): a is Agendamento => {
    if (!isAgendamentoValido(a)) return false;
    if (viewMode === 'calendario' && !statusFiltro && a.status === 'CANCELADO') return false;
    return true;
  });
  const statusResumo = STATUS_FILTRO.map((status) => ({
    status,
    total: agendamentos.filter((agendamento) => agendamento.status === status).length,
  }));

  const showToast = useCallback((msg: string, severity: 'success' | 'error') => {
    setToast({ open: true, msg, severity });
  }, []);

  const events = agendamentos.map((a) => {
    const isAvulso = a.origem === 'AVULSA';
    const colors = isAvulso
      ? { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' }
      : (STATUS_COLORS[a.status] ?? { bg: '#ccc', text: '#000', border: '#999' });
    return {
      id: String(a.id),
      title: isAvulso ? `Avulso · ${a.pacienteNome}` : `${a.pacienteNome} · ${a.dentistaNome}`,
      start: a.dataInicio,
      end: a.dataFim,
      display: 'block',
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: { agendamento: a },
    };
  });

  const handleCalViewChange = (view: CalView) => {
    setCalView(view);
    calRef.current?.getApi().changeView(view);
  };

  const handleNav = (action: 'prev' | 'next' | 'today') => {
    const api = calRef.current?.getApi();
    if (!api) return;
    if (action === 'prev') api.prev();
    else if (action === 'next') api.next();
    else api.today();
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          color: '#fff',
          background:
            'radial-gradient(circle at top right, rgba(29,158,117,0.92), transparent 34%), linear-gradient(135deg, #082F2A 0%, #0F6E56 100%)',
          boxShadow: '0 18px 50px rgba(8, 80, 65, 0.18)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -80,
            top: -90,
            width: 220,
            height: 220,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.68)' }}>
              Fluxo do dia
            </Typography>
            <Typography variant="h1" sx={{ color: '#fff', mt: 0.5 }}>
              Agenda operacional
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.75 }}>
              Organize o dia, confirme horários e inicie atendimentos clínicos.
            </Typography>
            {canFiltrarDentista && dentistaSelecionado && (
              <Chip
                size="small"
                label={`Agenda: ${dentistaSelecionado.nome}`}
                onDelete={() => { setDentistaFiltroId(''); setPage(0); }}
                sx={{ mt: 1.25, bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.75)' } }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ position: 'relative' }}>
            {statusResumo.map(({ status, total }) => (
              <StatusChip
                key={status}
                label={`${STATUS_LABELS[status]}: ${total}`}
                statusColor={STATUS_COLORS[status]}
                sx={{ boxShadow: '0 8px 22px rgba(0,0,0,0.12)' }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {canFiltrarDentista && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2.5, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.04)' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                Escopo da agenda
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veja todos os dentistas ou filtre a agenda de um profissional.
              </Typography>
            </Box>
            <DentistaFiltroAutocomplete
              dentistas={dentistas}
              value={dentistaSelecionado}
              onChange={(id) => { setDentistaFiltroId(id); setPage(0); }}
              width={{ xs: '100%', sm: 320 }}
            />
          </Stack>
        </Paper>
      )}

      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2.5, borderRadius: 3, border: '1px solid rgba(15,110,86,0.08)', boxShadow: '0 10px 30px rgba(22, 43, 35, 0.04)' }}
      >
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>

        <ToggleButtonGroup value={viewMode} exclusive size="small"
          onChange={(_, v) => v && setViewMode(v)}>
          <ToggleButton value="calendario" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <CalendarMonthOutlined sx={{ fontSize: 16 }} /> Calendário
          </ToggleButton>
          <ToggleButton value="lista" sx={{ px: 1.5, gap: 0.75, fontSize: '0.8rem' }}>
            <TableRowsOutlined sx={{ fontSize: 16 }} /> Lista
          </ToggleButton>
        </ToggleButtonGroup>

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
          onClick={() => handleOpenNew()} size="small" sx={{ height: 36, borderRadius: 999, px: 2 }}>
          Novo agendamento
        </Button>
      </Stack>
      </Paper>

      {viewMode === 'calendario' && (
        <Box sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(15,110,86,0.08)',
          boxShadow: '0 12px 34px rgba(22,43,35,0.06)',
          '& .fc': { fontFamily: 'inherit', fontSize: '0.82rem' },
          '& .fc .fc-scrollgrid': { borderColor: 'rgba(15,110,86,0.10)' },
          '& .fc-theme-standard td, & .fc-theme-standard th': { borderColor: 'rgba(15,110,86,0.07)' },
          '& .fc-col-header-cell': {
            fontWeight: 600, color: 'text.secondary', fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            backgroundColor: 'rgba(15,110,86,0.035)', padding: '8px 0',
          },
          '& .fc-timegrid-slot': { height: '3em' },
          '& .fc-timegrid-slot-label': { fontSize: '0.7rem', color: 'text.disabled' },
          '& .fc-day-today': { backgroundColor: 'rgba(29,158,117,0.06) !important' },
          '& .fc-timegrid-now-indicator-line': { borderColor: '#1D9E75' },
          '& .fc-timegrid-now-indicator-arrow': { borderColor: '#1D9E75', color: '#1D9E75' },
          '& .fc-timegrid-event .fc-event-main, & .fc-timegrid-event .fc-event-main-frame': {
            overflow: 'hidden',
          },
          '& .fc-event': {
            cursor: 'pointer', borderRadius: '6px', border: 'none',
            borderLeft: '3px solid',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          },
          '& .fc-event:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.12)', filter: 'brightness(0.98)' },
          '& .fc-daygrid-event': { fontSize: '0.72rem', backgroundColor: 'transparent !important', boxShadow: 'none', borderLeft: 'none' },
          '& .fc-daygrid-event:hover': { filter: 'none', boxShadow: 'none' },
          '& .fc-timegrid-event': { fontSize: '0.74rem', marginRight: 1 },
          '& .fc-list': { border: '1px solid rgba(15,110,86,0.10)' },
          '& .fc-list-event': { cursor: 'pointer' },
          '& .fc-list-event:hover td': { backgroundColor: 'rgba(29,158,117,0.06)' },
          '& .fc-list-day-cushion': { backgroundColor: 'rgba(15,110,86,0.05)' },
          '& .fc-highlight': { backgroundColor: 'rgba(29,158,117,0.14)' },
          '& .fc-timegrid-col.fc-day-today .fc-timegrid-col-frame': { cursor: 'cell' },
        }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1.5, px: 0.5 }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="Anterior">
                <IconButton size="small" onClick={() => handleNav('prev')}
                  sx={{ border: '1px solid', borderColor: 'rgba(15,110,86,0.12)', borderRadius: 2 }}>
                  <ChevronLeftOutlined sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Próximo">
                <IconButton size="small" onClick={() => handleNav('next')}
                  sx={{ border: '1px solid', borderColor: 'rgba(15,110,86,0.12)', borderRadius: 2 }}>
                  <ChevronRightOutlined sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Button size="small" variant="outlined" onClick={() => handleNav('today')}
                sx={{ ml: 0.5, height: 32, px: 1.5 }}>
                Hoje
              </Button>
            </Stack>

            <Typography
              variant="h3"
              sx={{ flex: 1, textAlign: { xs: 'left', sm: 'center' }, textTransform: 'capitalize', fontWeight: 600 }}
            >
              {calTitle}
            </Typography>

            <ToggleButtonGroup value={calView} exclusive size="small"
              onChange={(_, v) => v && handleCalViewChange(v)}>
              {CAL_VIEWS.map((v) => (
                <ToggleButton key={v.value} value={v.value} sx={{ fontSize: '0.75rem', px: 1.5 }}>
                  {v.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={calView}
            locale={ptBrLocale}
            headerToolbar={false}
            events={events}
            eventContent={renderEventContent}
            editable={false}
            eventStartEditable={false}
            eventDurationEditable={false}
            datesSet={(arg) => {
              setCalTitle(arg.view.title);
              setCalRangeInicio(fmt(arg.start));
              const endInclusive = new Date(arg.end);
              endInclusive.setMilliseconds(endInclusive.getMilliseconds() - 1);
              setCalRangeFim(fmt(endInclusive));
            }}
            height="calc(100vh - 290px)"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            nowIndicator
            dayMaxEvents={3}
            expandRows
            allDaySlot={false}
            eventClick={(info) => {
              const ag = info.event.extendedProps.agendamento as Agendamento | undefined;
              if (ag) openView(ag);
            }}
            select={(info) => handleOpenNew(info.startStr, info.endStr)}
            selectable
            selectMirror={false}
            longPressDelay={0}
            eventDragMinDistance={9999}
          />
        </Box>
      )}

      {viewMode === 'lista' && (
        <Box sx={{ border: '1px solid rgba(15,110,86,0.08)', borderRadius: 3, overflow: 'hidden', backgroundColor: 'background.paper', boxShadow: '0 12px 34px rgba(22,43,35,0.06)' }}>
          {agendamentos.length === 0 ? (
            <EmptyState
              title={isLoading ? 'Carregando agendamentos...' : 'Nenhum agendamento encontrado'}
              description={!isLoading ? 'Ajuste os filtros ou crie um novo agendamento.' : undefined}
              actionLabel={!isLoading ? 'Novo agendamento' : undefined}
              onAction={!isLoading ? () => openNew() : undefined}
            />
          ) : (
            agendamentos.map((a, i) => (
              <Box key={a.id} onClick={() => openView(a)} sx={{
                p: 2.25, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2,
                borderBottom: i < agendamentos.length - 1 ? '0.5px solid' : 'none',
                borderColor: 'divider',
                transition: 'background-color 0.15s ease, transform 0.15s ease',
                '&:hover': { backgroundColor: 'background.default', transform: 'translateX(2px)' },
              }}>
                <Box sx={{ width: 5, alignSelf: 'stretch', borderRadius: 999, backgroundColor: STATUS_COLORS[a.status]?.border ?? '#999', flexShrink: 0 }} />
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
              count={isLoading ? 0 : paginationCount}
              page={page}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              onPageChange={(_, p) => setPage(p)}
              labelDisplayedRows={({ from, to }) => `${from}–${to}`}
              backIconButtonProps={{ disabled: page === 0 || isLoading }}
              nextIconButtonProps={{ disabled: (data?.last ?? true) || isLoading }}
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
