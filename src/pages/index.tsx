import dynamic from "next/dynamic";
import React, {useState} from "react";
import {KiteSpotsMap} from "@/components/map/KiteSpotsMap";
import {useSelectedLocation} from "@/store/useSelectedLocation";
import {useLocationsStore} from "@/store/locationsStore";
import {useWeatherDataStore} from "@/store/weatherDataStore";
import {BeachInfo} from "@/components/layouts/BeachInfo";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import {PuffDataLoader} from "@/components/common/PuffDataLoader";
import {Card, CardBody, CardHeader, IconButton} from "@material-tailwind/react";
import PageWrapper from "@/components/common/PageWrapper";
import {useTranslation} from "next-i18next";
import {useActiveLanguage} from "@/util/languageControl/useActiveLanguage";
import {useWeatherData} from "@/util/axiosRequests/useWeatherData";
import {useLocations} from "@/util/axiosRequests/useLocations";
import styleClasses from "@/pages/index.module.css";

const WindVsRain = dynamic(() => import("@/components/dataCharts/WindVsRain"), {
  ssr: false,
});
const WindDirection = dynamic(() => import("@/components/dataCharts/WindDirection"), {
  ssr: false,
});

function Home() {
  const { isWeatherDataLoading,
    windGusts,
    windDirection,
    windSpeed,
    precipitation } = useWeatherDataStore();
  const { isLocationsLoading, locationsError, locations } = useLocationsStore();
  const selectedLocation = useSelectedLocation();
  const [activeLandingPageView, setActiveLandingPageView] = useState<"info" | "weather">("info");
  const { t} = useTranslation();

  useWeatherData();
  useLocations();

  useActiveLanguage();

  const setInfoPageToActive = () => {
    setActiveLandingPageView("info");
  }
  const setWeatherPageToActivate = () => {
    setActiveLandingPageView("weather");
  }

  const hasWeatherDataForSelectedLocation = Boolean(windGusts && windSpeed && precipitation && windDirection);

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
          {isLocationsLoading && (
            <div className="w-full flex justify-center" style={{ height: "40vh" }}>
              <PuffDataLoader />
            </div>
          )}
          {!isLocationsLoading && locationsError && (
            <p>{t("failedToLoadLocations")}</p>
          )}
          {!isLocationsLoading && !locationsError && locations.length === 0 && (
            <p>{t("noKiteSpotsAvailable")}</p>
          )}
          {!isLocationsLoading && !locationsError && locations.length > 0 && (
            <>
              <div className="flex gap-4 flex-wrap items-center">
                <div className="flex gap-4 flex-shrink-0">
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
                </div>
                <p className="font-bold text-3xl" style={{borderBottom: "solid black"}}>{selectedLocation?.name}</p>
              </div>
              {(activeLandingPageView === "info") && (
                <div>
                  <BeachInfo />
                </div>
              )}
              {(activeLandingPageView === "weather") && (
                <div className="flex flex-col gap-4">
                  {isWeatherDataLoading && (
                    <PuffDataLoader />
                  )}
                  {!isWeatherDataLoading && hasWeatherDataForSelectedLocation && (
                    <>
                      <Card placeholder="" className="h-[220px] bg-webPageBodyBackground">
                        <div className="h-[220px]">
                          <WindVsRain data={{ windGust: windGusts!, windSpeed: windSpeed!, precipitation: precipitation! }} />
                        </div>
                      </Card>
                      <Card placeholder="" className="h-[220px] bg-webPageBodyBackground">
                        <div className="h-[220px]">
                          <WindDirection data={windDirection} windDirectionDescriptions={selectedLocation?.windDirectionDescriptions ?? []} />
                        </div>
                      </Card>
                    </>
                  )}
                  {!isWeatherDataLoading && !hasWeatherDataForSelectedLocation && (
                    <Card placeholder="" className="h-[220px] bg-webPageBodyBackground flex items-center justify-center">
                      <p>{t("weatherDataNotAvailableYet")}</p>
                    </Card>
                  )}
                </div>
              )}
            </>
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
