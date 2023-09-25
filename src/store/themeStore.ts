// store.ts
import { create } from 'zustand';

// Define the possible theme values
type Theme = 'normal-mode' | 'dark-mode';

// Define the state's shape
interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: 'normal-mode',
  toggleTheme: () => set((state) => {
    const newTheme: Theme = state.theme === 'normal-mode' ? 'dark-mode' : 'normal-mode';
    return { theme: newTheme };
  })
}));

export default useThemeStore;
