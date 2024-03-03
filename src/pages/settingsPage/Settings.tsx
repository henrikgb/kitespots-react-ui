import {SettingsContent} from "@/pages/settingsPage/SettingsContent";
import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

function Settings() {
  return (
    <div>
      <SettingsContent />
    </div>
  )
}

// Add getStaticProps at the bottom of your pages/index.tsx file
export async function getStaticProps(context: GetStaticPropsContext) {
  const { locale } = context;
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'home'])), // 'en' is the default locale
    },
  };
}

export default Settings;