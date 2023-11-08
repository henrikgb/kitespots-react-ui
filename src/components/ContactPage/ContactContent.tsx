import React from 'react';
import { Trans, useTranslation } from 'next-i18next'
import useThemeStore from "@/store/themeStore";

export const ContactContent: React.FC = () => {
  const {theme} = useThemeStore();
  const { t } = useTranslation();
  const email = 'henrik.busengdal@kitespots.no';

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
