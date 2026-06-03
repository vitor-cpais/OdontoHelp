import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, List, ListItem, ListItemText, Checkbox,
  FormControlLabel, Box,
} from '@mui/material';
import { useState } from 'react';
import type { ItemPlano } from '../planoTratamento/types';

interface Props {
  open: boolean;
  itens: ItemPlano[];
  onClose: () => void;
  onConfirm: (ids: number[]) => void;
  loading?: boolean;
}

export default function BaixaPlanoDialog({ open, itens, onClose, onConfirm, loading }: Props) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm([...selecionados]);
    setSelecionados(new Set());
  };

  const handleClose = () => {
    setSelecionados(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem' }}>Dar baixa no plano de tratamento?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Existem outros procedimentos pendentes neste dente. Marque os que foram realizados neste atendimento:
        </Typography>
        <List dense>
          {itens.map((item) => (
            <ListItem key={item.id} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selecionados.has(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                }
                label={
                  <ListItemText
                    primary={`Dente ${item.numeroDente} — ${item.procedimentoNome}`}
                    secondary={item.observacao ?? undefined}
                  />
                }
                sx={{ width: '100%', ml: 0 }}
              />
            </ListItem>
          ))}
        </List>
        {itens.length === 0 && (
          <Box sx={{ py: 2 }}><Typography variant="body2">Nenhum item pendente.</Typography></Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Pular</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || selecionados.size === 0}
        >
          Confirmar baixa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
