import {GetStaticPropsContext} from "next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Card, CardBody, CardHeader, IconButton} from "@material-tailwind/react";
import {useTranslation} from "next-i18next";
import PageWrapper from "@/components/PageWrapper";
import React, {useEffect, useState} from "react";
import usei18LanguageStore from "@/store/i18languageStore";
import {KiteSpotsMap} from "@/components/map/KiteSpotsMap";

export default function TestPage() {
  const { t, i18n } = useTranslation();
  const {activeLanguage} = usei18LanguageStore();
  const [activeLandingPageView, setActiveLandingPageView] = useState<"info" | "weather">("info");

  useEffect(() => {
    i18n.changeLanguage(activeLanguage);
  }, [i18n, activeLanguage]);

  const activateInfoPage = () => {
    setActiveLandingPageView("info");
  }
  const activateWeatherPage = () => {
    setActiveLandingPageView("weather");
  }

  return(
    <PageWrapper>
      <Card className="mt-6 w-full bg-webPageContainerBody">
        <CardHeader
          color="blue-gray"
          className="flex h-full justify-center items-center"
          style={{ height: 300 }}
        >
          <KiteSpotsMap />
        </CardHeader>
        <CardBody className="flex justify-start">
          <div className="h-full">
            <div className="flex gap-4">
              <IconButton size="lg" color={activeLandingPageView === "info" ? "blue-gray" : "white"} onClick={activateInfoPage}>
                <div className="flex w-full flex-col justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                  </svg>
                  <p style={{fontSize: 9}}>{t("info")}</p>
                </div>
              </IconButton>
              <IconButton size="lg" color={activeLandingPageView === "weather" ? "blue-gray" : "white"} onClick={activateWeatherPage}>
                <div className="flex w-full flex-col justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
                  </svg>
                  <p style={{fontSize: 9}}>{t("weather")}</p>
                </div>
              </IconButton>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageWrapper>
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