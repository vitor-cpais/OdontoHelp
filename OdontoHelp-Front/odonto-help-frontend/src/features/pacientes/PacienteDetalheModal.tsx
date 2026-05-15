// src/features/pacientes/PacienteDetalheModal.tsx
import {
  Dialog, DialogTitle, DialogContent,
  Box, Tabs, Tab, Typography, IconButton,
  Divider, Skeleton, Chip,
} from '@mui/material';
import { Close, PersonOutlined } from '@mui/icons-material';
import { useState } from 'react';
import OdontogramaVisual from '../odontograma/OdontogramaVisual';
import HistoricoOdontogramaTab from '../odontograma/HistoricoOdontogramaTab';
import PlanoTratamentoTab from '../planoTratamento/PlanoTratamentoTab';
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
  const [tab, setTab] = useState(0);
  const [denteSelecionado, setDenteSelecionado] = useState<number | null>(null);

  if (!paciente) return null;

  const handleDenteClick = (numero: number) => {
    setDenteSelecionado((prev) => (prev === numero ? null : numero));
    // Se clicou num dente e estava na aba odontograma, vai para histórico filtrado
    if (tab === 1) setTab(2);
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
          onChange={(_, v) => {
            setTab(v);
            if (v !== 2) setDenteSelecionado(null);
          }}
          sx={{
            borderBottom: '0.5px solid',
            borderColor: 'divider',
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, fontSize: '0.82rem', textTransform: 'none' },
          }}
        >
          <Tab label="Dados" />
          <Tab label="Odontograma" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                Histórico
                {denteSelecionado && (
                  <Chip
                    label={`Dente ${denteSelecionado}`}
                    size="small"
                    color="primary"
                    sx={{ fontSize: '0.62rem', height: 16, borderRadius: '4px' }}
                  />
                )}
              </Box>
            }
          />
          <Tab label="Plano de tratamento" />
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

        {/* Aba Odontograma */}
        <TabPanel value={tab} index={1}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clique em um dente para filtrar o histórico por ele.
          </Typography>
          <OdontogramaVisual
            pacienteId={paciente.id}
            selectedDente={denteSelecionado}
            onDenteClick={handleDenteClick}
          />
        </TabPanel>

        {/* Aba Histórico */}
        <TabPanel value={tab} index={2}>
          <HistoricoOdontogramaTab
            pacienteId={paciente.id}
            denteFiltro={denteSelecionado}
            onClearFiltro={() => setDenteSelecionado(null)}
          />
        </TabPanel>

        {/* Aba Plano de Tratamento */}
        <TabPanel value={tab} index={3}>
          <PlanoTratamentoTab pacienteId={paciente.id} />
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
