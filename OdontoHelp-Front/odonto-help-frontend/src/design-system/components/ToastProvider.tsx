import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { AlertColor, SnackbarOrigin } from '@mui/material';

interface ToastOptions {
  message: string;
  severity?: AlertColor;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  anchorOrigin?: SnackbarOrigin;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
}: ToastProviderProps) {
  const [toast, setToast] = useState<(ToastOptions & { open: boolean })>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = useCallback((options: ToastOptions) => {
    setToast({ open: true, severity: options.severity ?? 'success', message: options.message });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={anchorOrigin}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
