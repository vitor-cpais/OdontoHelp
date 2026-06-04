import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';
import { createOdontoTheme } from '../design-system/theme/theme';
import { useUiPreferencesStore } from '../shared/store/uiPreferencesStore';
import queryClient from './queryClient';
import router from './router';
import { AppInitializer } from './AppInitializer';

export default function App() {
  const themeMode = useUiPreferencesStore((state) => state.themeMode);
  const theme = useMemo(() => createOdontoTheme(themeMode), [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppInitializer>
          <RouterProvider router={router} />
        </AppInitializer>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
