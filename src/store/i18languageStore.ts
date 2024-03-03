import { create } from 'zustand';

interface i18languageState {
    activeLanguage: "en" | "nb",
    norwegianButtonColor: "white" | "blue-gray";
    englishButtonColor: "white" | "blue-gray";

    setActiveLanguage: (value: "en" | "nb") => void;
    setNorwegianButtonColor: (value: "white" | "blue-gray") => void;
    setEnglishButtonColor: (value: "white" | "blue-gray") => void;
}

const usei18LanguageStore = create<i18languageState>((set) => ({
  activeLanguage: "en",
  norwegianButtonColor: "white",
  englishButtonColor: "blue-gray",
  setActiveLanguage: (value: "en" | "nb") => {
    set(()=> ({
      activeLanguage: value
    }))
  },
  setNorwegianButtonColor: (value: "white" | "blue-gray" ) => {
    set(() => ({
      norwegianButtonColor: value
    }))
  },
  setEnglishButtonColor: (value: "white" | "blue-gray" ) => {
    set(() => ({
      englishButtonColor: value
    }))
  }
}));

export default usei18LanguageStore;
