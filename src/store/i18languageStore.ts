import { create } from 'zustand';

interface i18languageState {
    activeLanguage: "en" | "nb",
    setActiveLanguage: (value: "en" | "nb") => void;
}

const usei18LanguageStore = create<i18languageState>((set) => ({
  activeLanguage: "en",
  setActiveLanguage: (value: "en" | "nb") => {
    set(()=> ({
      activeLanguage: value
    }))
  },
}));

export default usei18LanguageStore;
