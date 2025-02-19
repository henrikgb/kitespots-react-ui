import React, {useState} from "react";
import {KiteSpotsMap} from "@/components/map/KiteSpotsMap";
import WindVsRain from "@/components/dataCharts/WindVsRain";
import WindDirection from "@/components/dataCharts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";
import {BeachInfo} from "@/components/layouts/BeachInfo";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import {PuffDataLoader} from "@/components/common/PuffDataLoader";
import {Card, CardBody, CardHeader, IconButton} from "@material-tailwind/react";
import PageWrapper from "@/components/common/PageWrapper";
import {useTranslation} from "next-i18next";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";
import {useMeteomaticsWeatherData} from "@/util/axiosRequests/useMeteomaticsWeatherData";
import styleClasses from "@/pages/index.module.css";

function Home() {
  const { isMeteomaticsDataLoading,
    windGusts10ms,
    windDirection10ms,
    windSpeed10ms,
    precipitation } = useMeteomaticsWeatherDataStore();
  const {nameId, windDirectionDescriptions} = useBeachDescriptionStore();
  const [activeLandingPageView, setActiveLandingPageView] = useState<"info" | "weather">("info");
  const { t} = useTranslation();
  
  useMeteomaticsWeatherData();

  useActiveLanguage();

  const setInfoPageToActive = () => {
    setActiveLandingPageView("info");
  }
  const setWeatherPageToActivate = () => {
    setActiveLandingPageView("weather");
  }

  return (
    <PageWrapper>
      <Card className="mt-6 w-full bg-webPageContainerBody">
        <CardHeader
          color="blue-gray"
          className={`${styleClasses.mapContainer}`}
        >
          <KiteSpotsMap />
        </CardHeader>
        <CardBody className="flex flex-col gap-4 justify-start">
          <div className="flex gap-4">
            <IconButton size="lg" color={activeLandingPageView === "info" ? "blue-gray" : "white"} onClick={setInfoPageToActive}>
              <div className="flex w-full flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                </svg>
                <p style={{fontSize: 9}}>{t("info")}</p>
              </div>
            </IconButton>
            <IconButton size="lg" color={activeLandingPageView === "weather" ? "blue-gray" : "white"} onClick={setWeatherPageToActivate}>
              <div className="flex w-full flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
                </svg>
                <p style={{fontSize: 9}}>{t("weather")}</p>
              </div>
            </IconButton>
            <p className={"flex justify-center font-bold text-3xl w-fit"} style={{borderBottom: "solid black"}}>{nameId ? (nameId?.charAt(0).toUpperCase() + nameId?.slice(1).toLowerCase()) : undefined}</p>
          </div>
          {(activeLandingPageView === "info") && (
            <div>
              <BeachInfo />
            </div>
          )}
          {(activeLandingPageView === "weather") && (
            <div className="flex flex-col gap-4">
              {isMeteomaticsDataLoading && (
                <PuffDataLoader />
              )}
              {(!isMeteomaticsDataLoading && windGusts10ms && windSpeed10ms && precipitation) && (
                <Card placeholder="" className="h-[220px] bg-webPageBodyBackground">
                  <div className="h-[220px]">
                    <WindVsRain data={{ windGust: windGusts10ms[0].dates, windSpeed: windSpeed10ms[0].dates, precipitation: precipitation[0].dates }} />
                  </div>
                </Card>
              )}
              {isMeteomaticsDataLoading && (
                <PuffDataLoader />
              )}
              {(!isMeteomaticsDataLoading && windDirection10ms && windDirection10ms[0]) && (
                <Card placeholder="" className="h-[220px] bg-webPageBodyBackground">
                  <div className="h-[220px]">
                    <WindDirection data={windDirection10ms[0].dates} windDirectionDescriptions={windDirectionDescriptions ? windDirectionDescriptions : []} />
                  </div>
                </Card>
              )}
            </div>
          )}
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

export default Home;