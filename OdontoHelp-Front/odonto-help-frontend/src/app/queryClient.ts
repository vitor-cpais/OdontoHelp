import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 minutos antes de considerar stale
      gcTime: 1000 * 60 * 10,        // 10 minutos no cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: unknown) => {
        console.error('[mutation error]', error);
      },
    },
  },
});

export default queryClient;
