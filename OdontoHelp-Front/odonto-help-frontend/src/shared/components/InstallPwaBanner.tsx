import { useEffect, useState } from 'react';
import { Alert, Button, IconButton } from '@mui/material';
import { Close, GetAppOutlined } from '@mui/icons-material';

const DISMISS_KEY = 'odonto-pwa-install-dismissed';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function InstallPwaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile() || isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <Alert
      severity="info"
      icon={<GetAppOutlined fontSize="inherit" />}
      action={(
        <IconButton
          size="small"
          aria-label="Fechar"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, '1');
            setVisible(false);
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
      sx={{ mb: 2, borderRadius: 2 }}
    >
      Instale o OdontoHelp na tela inicial: no menu do navegador, use{' '}
      <strong>Adicionar à tela inicial</strong> (iPhone) ou <strong>Instalar app</strong> (Android).
      <Button
        size="small"
        variant="outlined"
        sx={{ ml: 1, mt: { xs: 1, sm: 0 } }}
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1');
          setVisible(false);
        }}
      >
        Entendi
      </Button>
    </Alert>
  );
}
