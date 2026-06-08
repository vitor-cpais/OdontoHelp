import {
  Autocomplete, Box, Button, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { FilterAltOffOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { usePacientes } from '../pacientes/usePacientes';
import type { Paciente } from '../pacientes/types';
import { useDentistas } from '../dentistas/useDentistas';
import DentistaFiltroAutocomplete from '../../shared/components/DentistaFiltroAutocomplete';
import { useDebounce } from '../../shared/hooks/useDebounce';
import {
  type CobrancasFiltros, type InadimplenciaFiltros, type NfseFiltros, type OrigemCobranca,
  type PendentesCobrancaFiltros, type StatusFinanceiro, type StatusNfse,
} from './types';
import { ORIGEM_COBRANCA_LABELS, STATUS_FINANCEIRO_LABELS, STATUS_NFSE_LABELS } from './financeiroLabels';

function PacienteFiltroAutocomplete({
  pacienteId,
  pacienteNome,
  onChange,
}: {
  pacienteId?: number;
  pacienteNome?: string;
  onChange: (id: number | undefined, nome: string) => void;
}) {
  const [busca, setBusca] = useState(pacienteNome ?? '');
  const nomeDebounced = useDebounce(busca, 400);
  const { data } = usePacientes({ page: 0, size: 20, nome: nomeDebounced || undefined });
  const options = data?.content ?? [];
  const value = pacienteId
    ? options.find((p) => p.id === pacienteId) ?? ({ id: pacienteId, nome: pacienteNome ?? '' } as Paciente)
    : null;

  return (
    <Autocomplete
      size="small"
      sx={{ minWidth: 220, flex: 1 }}
      options={options}
      value={value}
      inputValue={busca}
      onInputChange={(_, v) => setBusca(v)}
      onChange={(_, p) => onChange(p?.id, p?.nome ?? '')}
      getOptionLabel={(p) => p.nome}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => <TextField {...params} label="Paciente" placeholder="Todos" />}
    />
  );
}

function FilterShell({ children, onClear }: {
  children: React.ReactNode; onClear: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} flexWrap="wrap" useFlexGap>
        {children}
        <Button size="small" startIcon={<FilterAltOffOutlined />} onClick={onClear} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
          Limpar filtros
        </Button>
      </Stack>
    </Paper>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <TextField
      size="small"
      type="date"
      label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{ width: { xs: '100%', sm: 160 } }}
    />
  );
}

export function CobrancasFilterBar({
  filtros,
  onChange,
  onClear,
}: {
  filtros: CobrancasFiltros;
  onChange: (f: CobrancasFiltros) => void;
  onClear: () => void;
}) {
  const patch = (p: Partial<CobrancasFiltros>) => onChange({ ...filtros, ...p });

  return (
    <FilterShell onClear={onClear}>
      <PacienteFiltroAutocomplete
        pacienteId={filtros.pacienteId}
        pacienteNome={filtros.pacienteNome}
        onChange={(id, nome) => patch({ pacienteId: id, pacienteNome: nome })}
      />
      <TextField
        select size="small" label="Status" value={filtros.status ?? ''}
        onChange={(e) => patch({ status: e.target.value as StatusFinanceiro | '' })}
        sx={{ width: { xs: '100%', sm: 160 } }}
      >
        <MenuItem value="">Todos</MenuItem>
        {(Object.keys(STATUS_FINANCEIRO_LABELS) as StatusFinanceiro[]).map((s) => (
          <MenuItem key={s} value={s}>{STATUS_FINANCEIRO_LABELS[s]}</MenuItem>
        ))}
      </TextField>
      <TextField
        select size="small" label="Origem" value={filtros.origemTipo ?? ''}
        onChange={(e) => patch({ origemTipo: e.target.value as OrigemCobranca | '' })}
        sx={{ width: { xs: '100%', sm: 150 } }}
      >
        <MenuItem value="">Todas</MenuItem>
        {(Object.keys(ORIGEM_COBRANCA_LABELS) as OrigemCobranca[]).map((o) => (
          <MenuItem key={o} value={o}>{ORIGEM_COBRANCA_LABELS[o]}</MenuItem>
        ))}
      </TextField>
      <DateField label="Emissão de" value={filtros.dataEmissaoDe} onChange={(v) => patch({ dataEmissaoDe: v })} />
      <DateField label="Emissão até" value={filtros.dataEmissaoAte} onChange={(v) => patch({ dataEmissaoAte: v })} />
    </FilterShell>
  );
}

export function PendentesFilterBar({
  filtros,
  onChange,
  onClear,
}: {
  filtros: PendentesCobrancaFiltros;
  onChange: (f: PendentesCobrancaFiltros) => void;
  onClear: () => void;
}) {
  const { data: dentistasData } = useDentistas({ page: 0, size: 100 });
  const dentistas = dentistasData?.content ?? [];
  const dentistaSelecionado = filtros.dentistaId
    ? dentistas.find((d) => d.id === filtros.dentistaId) ?? null
    : null;
  const patch = (p: Partial<PendentesCobrancaFiltros>) => onChange({ ...filtros, ...p });

  return (
    <FilterShell onClear={onClear}>
      <TextField
        size="small"
        label="Paciente"
        placeholder="Buscar por nome..."
        value={filtros.nomePaciente ?? ''}
        onChange={(e) => patch({ nomePaciente: e.target.value })}
        sx={{ minWidth: 220, flex: 1 }}
      />
      <DentistaFiltroAutocomplete
        dentistas={dentistas}
        value={dentistaSelecionado}
        onChange={(id) => patch({ dentistaId: id })}
        width={{ xs: '100%', sm: 220 }}
      />
      <DateField label="Finalizado de" value={filtros.dataFinalizacaoDe} onChange={(v) => patch({ dataFinalizacaoDe: v })} />
      <DateField label="Finalizado até" value={filtros.dataFinalizacaoAte} onChange={(v) => patch({ dataFinalizacaoAte: v })} />
    </FilterShell>
  );
}

export function InadimplenciaFilterBar({
  filtros,
  onChange,
  onClear,
}: {
  filtros: InadimplenciaFiltros;
  onChange: (f: InadimplenciaFiltros) => void;
  onClear: () => void;
}) {
  const patch = (p: Partial<InadimplenciaFiltros>) => onChange({ ...filtros, ...p });

  return (
    <FilterShell onClear={onClear}>
      <PacienteFiltroAutocomplete
        pacienteId={filtros.pacienteId}
        pacienteNome={filtros.pacienteNome}
        onChange={(id, nome) => patch({ pacienteId: id, pacienteNome: nome })}
      />
      <DateField label="Vencimento de" value={filtros.vencimentoDe} onChange={(v) => patch({ vencimentoDe: v })} />
      <DateField label="Vencimento até" value={filtros.vencimentoAte} onChange={(v) => patch({ vencimentoAte: v })} />
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography variant="caption" color="text.secondary">
          Mostra parcelas vencidas com saldo em aberto
        </Typography>
      </Box>
    </FilterShell>
  );
}

export function NfseFilterBar({
  filtros,
  onChange,
  onClear,
}: {
  filtros: NfseFiltros;
  onChange: (f: NfseFiltros) => void;
  onClear: () => void;
}) {
  const patch = (p: Partial<NfseFiltros>) => onChange({ ...filtros, ...p });

  return (
    <FilterShell onClear={onClear}>
      <PacienteFiltroAutocomplete
        pacienteId={filtros.pacienteId}
        pacienteNome={filtros.pacienteNome}
        onChange={(id, nome) => patch({ pacienteId: id, pacienteNome: nome })}
      />
      <TextField
        select size="small" label="Status" value={filtros.status ?? ''}
        onChange={(e) => patch({ status: e.target.value as StatusNfse | '' })}
        sx={{ width: { xs: '100%', sm: 180 } }}
      >
        <MenuItem value="">Todos</MenuItem>
        {(Object.keys(STATUS_NFSE_LABELS) as StatusNfse[]).map((s) => (
          <MenuItem key={s} value={s}>{STATUS_NFSE_LABELS[s]}</MenuItem>
        ))}
      </TextField>
      <DateField label="Criada de" value={filtros.criadoDe} onChange={(v) => patch({ criadoDe: v })} />
      <DateField label="Criada até" value={filtros.criadoAte} onChange={(v) => patch({ criadoAte: v })} />
      <TextField
        size="small"
        label="Nº NFS-e"
        placeholder="Buscar número..."
        value={filtros.numeroNfse ?? ''}
        onChange={(e) => patch({ numeroNfse: e.target.value })}
        sx={{ width: { xs: '100%', sm: 150 } }}
      />
    </FilterShell>
  );
}
