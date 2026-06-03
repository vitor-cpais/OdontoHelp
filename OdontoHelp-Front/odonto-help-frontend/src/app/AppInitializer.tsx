// src/app/AppInitializer.tsx
import { useTokenRefresh } from '../features/auth/useTokenRefresh';

/**
 * Componente que encapsula a lógica de inicialização da app.
 * Gerencia renovação proativa de token e outras inicializações necessárias.
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  // Monitora e renova o token proativamente
  useTokenRefresh();

  return <>{children}</>;
}
