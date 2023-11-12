import Image from "next/image";
import React, {useEffect} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";
import WindDirection from "@/components/Charts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";
import {BeachInfo} from "@/components/BeachInfo/BeachInfo";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'; // Import this
import { GetStaticPropsContext } from 'next';

function Home() {
  const { setMeteomaticsData,
    setSelectedLocation,
    windGusts10ms,
    windDirection10ms,
    windSpeed10ms,
    precipitation } = useMeteomaticsWeatherDataStore();
  const {windDirectionDescriptions} = useBeachDescriptionStore();

  useEffect(() => {
    axios.get('/api/meteomaticsData')
      .then((response) => {
        const data = response.data.data;
        setMeteomaticsData(data);
        setSelectedLocation("SELE"); // Set default location to Selestranden
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
        {(windGusts10ms && windSpeed10ms && precipitation) && (
          <div className={`${styleClasses.windVsRainGraph as string}`}>
            <WindVsRain data={{ windGust: windGusts10ms[0].dates, windSpeed: windSpeed10ms[0].dates, precipitation: precipitation[0].dates }} />
          </div>
        )}
        {windDirection10ms && windDirection10ms[0] && (
          <div className={`${styleClasses.windDirectionGraph as string} p-5`}>
            <WindDirection data={windDirection10ms[0].dates} windDirectionDescriptions={windDirectionDescriptions ? windDirectionDescriptions : []} />
          </div>
        )}
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