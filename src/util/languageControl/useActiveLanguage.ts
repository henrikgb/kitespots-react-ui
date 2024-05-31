import {useTranslation} from "react-i18next";
import usei18LanguageStore from "@/store/i18languageStore";
import {useEffect} from "react";

/**
 * This hook makes sure i18n use the selected active language.
 * There is a bug in the setup of i18n that sets active language back to default language every
 * time a new page is rendered. This hook prevents that from happening by changing i18n language
 * to the activeLanguage Zustand store state, which is the selected active language.
 */
export function useActiveLanguage() {
  const { i18n } = useTranslation();
  const { activeLanguage } = usei18LanguageStore();

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

}