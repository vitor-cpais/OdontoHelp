import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface UiPreferencesState {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      toggleThemeMode: () =>
        set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'odonto-ui-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
