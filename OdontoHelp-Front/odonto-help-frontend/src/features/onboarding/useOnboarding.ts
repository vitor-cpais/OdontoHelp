import { useEffect } from 'react';
import { useAuthStore } from '../../shared/store/authStore';
import { useOnboardingStore } from '../../shared/store/onboardingStore';

export function useOnboardingAutoOpen() {
  const usuario = useAuthStore((s) => s.usuario);
  const isOpen = useOnboardingStore((s) => s.isOpen);
  const open = useOnboardingStore((s) => s.open);
  const close = useOnboardingStore((s) => s.close);

  useEffect(() => {
    if (!usuario?.id || usuario.onboardingConcluido) return;
    open();
  }, [usuario?.id, usuario?.onboardingConcluido, open]);

  return { isOpen, close };
}
