import useThemeStore from "@/store/themeStore";
import {Trans, useTranslation} from 'next-i18next'
import React, {useEffect} from "react";
import usei18LanguageStore from "@/store/i18languageStore";

export function AboutContent() {
  const { theme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const kitespotsGithubRepo = 'https://github.com/henrikgb/kitespots-react-ui';
  const linkMeteomatics = 'https://www.meteomatics.com/';
  const linkStavangerKiteklubb = 'https://www.stavangerkiteklubb.com/';
  const {activeLanguage} = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-2xl mb-4"}>{t("aboutPageHeader")}</p>
      <div className="mb-4">
        <Trans i18nKey="aboutPageTextSection1">
          <a href={`${kitespotsGithubRepo}`} target="_blank" rel="noopener noreferrer" className={`font-bold text-link-color ${theme}`}></a>
        </Trans>
      </div>
      <p className="mb-4">{t("aboutPageTextSection2")}</p>
      <div className="mb-4">
        <Trans i18nKey="aboutPageTextSection3">
          <a href={`${linkMeteomatics}`} target="_blank" rel="noopener noreferrer" className={`font-bold text-link-color ${theme}`}></a>
        </Trans>
      </div>
      <div className="mb-4">
        <Trans i18nKey="aboutPageTextSection4">
          <a href={`${linkStavangerKiteklubb}`} target="_blank" rel="noopener noreferrer" className={`font-bold text-link-color ${theme}`}></a>
        </Trans>
      </div>  
      <p className="mb-4">{t("aboutPageTextSection5")}</p>
    </div>
  )
}
