import React from 'react';
import { useTranslation } from 'next-i18next';

export const SettingsContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeLang, setActiveLang] = React.useState<string>(i18n.language);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setActiveLang(lang);
  };

  return (
    <div className="text-container">
      <h1>{t("Settings")}</h1>
      <div className="flex gap-4">
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLang === 'en' ? 'bg-green-400' : 'bg-stone-100'} hover:bg-blue-400`}>
          <button onClick={() => changeLanguage('en')}>English</button>
        </div>
        <div className={`w-fit px-3 border-2 border-black cursor-pointer ${activeLang === 'nb' ? 'bg-green-400' : 'bg-stone-100'} hover:bg-blue-400`}>
          <button onClick={() => changeLanguage('nb')}>Norsk</button>
        </div>
      </div>
    </div>
  );
};
