import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { PlaylistAddCheckOutlined } from '@mui/icons-material';
import type { ItemPlano } from '../planoTratamento/types';

interface Props {
  itens: ItemPlano[];
  onRegistrar: (item: ItemPlano) => void;
}

export default function PlanoPendenteSugestao({ itens, onRegistrar }: Props) {
  if (itens.length === 0) return null;

  return (
    <Alert severity="info" icon={<PlaylistAddCheckOutlined fontSize="inherit" />}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Previsto no plano de tratamento
      </Typography>
      <Stack spacing={1}>
        {itens.map((item) => (
          <Box
            key={item.id}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
          >
            <Typography variant="body2" sx={{ flex: 1, minWidth: 180 }}>
              <strong>Dente {item.numeroDente}</strong> — {item.procedimentoNome}
              {item.observacao && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {item.observacao}
                </Typography>
              )}
            </Typography>
            <Button size="small" variant="outlined" onClick={() => onRegistrar(item)}>
              Registrar no atendimento
            </Button>
          </Box>
        ))}
      </Stack>
    </Alert>
  );
}
