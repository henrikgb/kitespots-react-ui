import React from 'react';
import { useTranslation } from 'react-i18next';
import useThemeStore from "@/store/themeStore";

export const SettingsContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeLang, setActiveLang] = React.useState<string>(i18n.language);
  const {theme, toggleTheme} = useThemeStore();

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setActiveLang(lang);
  };

  const setNormalMode = () => {
    if (theme !== 'normal-mode') toggleTheme();
  };

  const setDarkMode = () => {
    if (theme !== 'dark-mode') toggleTheme();
  };

  return (
    <div className={`text-container flex flex-col gap-4 ${theme}`}>
      <p className="font-bold text-3xl">{t("Settings")}</p>
      <div className="flex gap-4">
        <p>{t('changeLanguage')}</p>
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLang === 'en' ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
          <button onClick={() => changeLanguage('en')}>{t("english")}</button>
        </div>
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLang === 'nb' ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
          <button onClick={() => changeLanguage('nb')}>{t("norwegian")}</button>
        </div>
      </div>
      <div className="flex gap-4">
        <p>{t('changeStyleTheme')}</p>
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${theme === "normal-mode" ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
          <button onClick={setNormalMode}>Normal Mode</button>
        </div>
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${theme === "dark-mode" ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
          <button onClick={setDarkMode}>Dark Mode</button>
        </div>
      </div>
    </div>
  );
};
