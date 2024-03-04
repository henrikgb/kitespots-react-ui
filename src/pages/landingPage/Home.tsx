import styleClasses from "@/pages/landingPage/Home.module.css";
import {KiteSpotsMap} from "@/components/map/KiteSpotsMap";
import {BeachInfo} from "@/components/beachInfo/BeachInfo";
import {PuffDataLoader} from "@/components/loadingSpinners/PuffDataLoader";
import WindVsRain from "@/components/charts/WindVsRain";
import WindDirection from "@/components/charts/WindDirection";
import React, {useEffect, useState} from "react";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import axios from "axios";

export const Home = () => {
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

    
  return(<div className="flex flex-col">
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
  </div>)
}