import useThemeStore from "@/store/themeStore";
import { useTranslation } from "react-i18next";

export function AboutContent() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-2xl"}>{t("aboutPageHeader")}</p>
    </div>
  )
}
