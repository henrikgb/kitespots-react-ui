import React, {useEffect, useState} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";
import WindDirection from "@/components/Charts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";
import {BeachInfo} from "@/components/BeachInfo/BeachInfo";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import {PuffDataLoader} from "@/components/LoadingSpinners/PuffDataLoader";

function Home() {
  const { setMeteomaticsData,
    setSelectedLocation,
    windGusts10ms,
    windDirection10ms,
    windSpeed10ms,
    precipitation } = useMeteomaticsWeatherDataStore();
  const {windDirectionDescriptions} = useBeachDescriptionStore();
  const [isloading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get('/api/meteomaticsData')
      .then((response) => {
        const data = response.data.data;
        setMeteomaticsData(data);
        setSelectedLocation("SELE"); // Set default location to Selestranden
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching Meteomatics data:', error);
      });
  }, [setMeteomaticsData, setSelectedLocation]);

  return (
    <div className="flex flex-col">
      <div className={`${styleClasses.flexWrap1000}`}>
        <div className={`${styleClasses.mapContainer}`}>
          <KiteSpotsMap />
        </div>
        <BeachInfo />
      </div>
      <div className={`${styleClasses.bottomCraphContainer}`}>
        <div className={`${styleClasses.windVsRainGraph as string}`}>
          {isloading && (
            <div className="h-full flex flex-col justify-center items-center">
              <PuffDataLoader />
            </div>
          )}
          {(!isloading && windGusts10ms && windSpeed10ms && precipitation) && (
            <WindVsRain data={{ windGust: windGusts10ms[0].dates, windSpeed: windSpeed10ms[0].dates, precipitation: precipitation[0].dates }} />
          )}
        </div>
        <div className={`${styleClasses.windDirectionGraph as string} p-5`}>
          {isloading && (
            <div className="w-full h-full flex justify-center items-center">
              <PuffDataLoader />
            </div>
          )}
          {(!isloading && windDirection10ms && windDirection10ms[0]) && (
            <WindDirection data={windDirection10ms[0].dates} windDirectionDescriptions={windDirectionDescriptions ? windDirectionDescriptions : []} />  
          )}
        </div>
      </div>
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

export default Home;