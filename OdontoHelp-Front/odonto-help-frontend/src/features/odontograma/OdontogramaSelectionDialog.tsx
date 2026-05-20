import {
  Dialog, DialogTitle, DialogContent, Box, IconButton, Divider,
  Button, Chip,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import OdontogramaVisual from './OdontogramaVisual';

interface Props {
  open: boolean;
  pacienteId: number;
  selectedDentes: number[];
  onClose: () => void;
  onConfirm: (dentes: number[]) => void;
}

export default function OdontogramaSelectionDialog({
  open, pacienteId, selectedDentes, onClose, onConfirm,
}: Props) {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedDentes);

  useEffect(() => {
    if (open) {
      setLocalSelected(selectedDentes);
    }
  }, [open, selectedDentes]);

  const handleDenteClick = (numero: number) => {
    setLocalSelected((prev) => (
      prev.includes(numero) ? prev.filter((d) => d !== numero) : [...prev, numero]
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          Selecionar dentes
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2 }}>
        {localSelected.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {localSelected.map((d) => (
              <Chip
                key={d}
                label={String(d)}
                onDelete={() => setLocalSelected(localSelected.filter((x) => x !== d))}
              />
            ))}
          </Box>
        )}

        <OdontogramaVisual
          pacienteId={pacienteId}
          selectedDentes={localSelected}
          onDenteClick={handleDenteClick}
        />
      </DialogContent>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          size="small"
          disabled={localSelected.length === 0}
          onClick={() => onConfirm(localSelected)}
        >
          Confirmar seleção
        </Button>
      </Box>
    </Dialog>
  );
}
