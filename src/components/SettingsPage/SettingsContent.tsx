import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import useThemeStore from "@/store/themeStore";
import usei18LanguageStore from "@/store/i18languageStore";

export const SettingsContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {theme, toggleTheme} = useThemeStore();
  const {activeLanguage, setActiveLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  const changeLanguage = async (activeLanguage: "en" | "nb") => {
    await i18n.changeLanguage(activeLanguage);
    setActiveLanguage(activeLanguage);
  };

  const setNormalMode = () => {
    if (theme !== 'normal-mode') toggleTheme();
  };

  const setDarkMode = () => {
    if (theme !== 'dark-mode') toggleTheme();
  };

  return (
    <div className={`text-container flex flex-col gap-4 ${theme}`}>
      <p className="font-bold text-2xl">{t("Settings")}</p>
      <div className={`settings-container ${theme}`}>
        <p className="whitespace-nowrap">{t('changeLanguage')}</p>
        <div className="flex flex-wrap gap-4">
          <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLanguage === 'en' ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
            <button onClick={() => changeLanguage('en')}>{t("english")}</button>
          </div>
          <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLanguage === 'nb' ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
            <button onClick={() => changeLanguage('nb')}>{t("norwegian")}</button>
          </div>
        </div>
      </div>
      <div className={`settings-container ${theme}`}>
        <p>{t('changeStyleTheme')}</p>
        <div className="flex flex-wrap gap-4">
          <div className={`w-fit px-3 border-2 border-black cursor-pointer ${theme === "normal-mode" ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
            <button className="whitespace-nowrap" onClick={setNormalMode}>Normal Mode</button>
          </div>
          <div className={`w-fit px-3 border-2 border-black cursor-pointer ${theme === "dark-mode" ? `selected-button-color ${theme}` : `button-color ${theme}`} button-hover ${theme}`}>
            <button className="whitespace-nowrap" onClick={setDarkMode}>Dark Mode</button>
          </div>
        </div>
      </div>
    </div>
  );
};
