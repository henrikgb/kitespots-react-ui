import useThemeStore from "@/store/themeStore";
import { useTranslation } from "next-i18next";

export function AboutContent() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-3xl"}>{t("weatherDataFromOpenWeatherMap")}</p>
    </div>
  )
}
