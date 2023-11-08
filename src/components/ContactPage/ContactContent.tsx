import React, {useEffect} from 'react';
import {Trans, useTranslation} from 'next-i18next'
import useThemeStore from "@/store/themeStore";
import usei18LanguageStore from "@/store/i18languageStore";

export const ContactContent: React.FC = () => {
  const {theme} = useThemeStore();
  const { t, i18n } = useTranslation();
  const email = 'henrik.busengdal@kitespots.no';
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  return (
    <div className={`text-container ${theme}`}>
      <p className="font-bold text-2xl mb-4">{t('contactInfoHeader')}</p>
      <div className="mb-4">
        <Trans i18nKey="contactInfoMessagePart1" components={{ br: <br /> }}></Trans>
      </div>
      <Trans i18nKey="contactInfoEmail" values={{ email }}>
        <a href={`mailto:${email}`} className={`font-bold text-link-color ${theme}`}></a>
      </Trans>
      <br/>
      <p>{t('contactInfoMessagePart2')}</p>
    </div>
  );
};
