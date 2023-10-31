import React, { useEffect, useState } from "react";
import useThemeStore from "@/store/themeStore";
import { useTranslation } from "next-i18next";
import axios from 'axios';
import WindVsRain from "@/components/Charts/WindVsRain";

export function AboutContent() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-3xl"}>{t("weatherDataFromOpenWeatherMap")}</p>
    </div>
  )
}
