// store.ts
import { create } from 'zustand';


// Define the possible theme values
type Theme = 'normal-mode' | 'dark-mode';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = window.localStorage.getItem('theme');
    return storedTheme === 'dark-mode' ? 'dark-mode' : 'normal-mode';
  }
  return 'normal-mode';
};

// Define the state's shape
interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((state) => {
    const newTheme: Theme = state.theme === 'normal-mode' ? 'dark-mode' : 'normal-mode';
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('theme', newTheme);
    }
    return { theme: newTheme };
  })
}));

export default useThemeStore;
