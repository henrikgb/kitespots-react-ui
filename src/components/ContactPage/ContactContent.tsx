import React from 'react';
import { Trans, useTranslation } from 'next-i18next';

export const ContactContent: React.FC = () => {
  const { t } = useTranslation();
  const email = 'henrik-gb@hotmail.com';

  return (
    <div className="text-container">
      <h1 className="font-bold">{t('contactInfoHeader')}</h1>
      <Trans i18nKey="contactInfoMessagePart1" components={{ br: <br /> }}></Trans>
      <Trans i18nKey="contactInfoEmail" values={{ email }}>
        <a href={`mailto:${email}`} className="font-bold text-green-700"></a>
      </Trans>
      <p>{t('contactInfoMessagePart2')}</p>
    </div>
  );
};
