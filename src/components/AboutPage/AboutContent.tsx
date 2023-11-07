import useThemeStore from "@/store/themeStore";
import {Trans, useTranslation} from "react-i18next";
import React from "react";

export function AboutContent() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const kitespotsGithubRepo = 'https://github.com/henrikgb/kitespots-react-ui';
  const linkMeteomatics = 'https://www.meteomatics.com/';
  const linkStavangerKiteklubb = 'https://www.stavangerkiteklubb.com/';

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
