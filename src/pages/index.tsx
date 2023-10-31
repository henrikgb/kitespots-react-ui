import Image from "next/image";
import React, {useEffect} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";
import WindDirection from "@/components/Charts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {StarRating} from "@/util/StarRating";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";

export default function Home() {
  const { setMeteomaticsData,
    setSelectedLocation,
    windDirection10ms,
    windSpeed10ms,
    precipitation } = useMeteomaticsWeatherDataStore();
  const {
    nameId,
    image,
    beginnerScore,
    freestyleScore,
    waveScore} = useBeachDescriptionStore();

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
  }, []);

  return (
    <div className="flex flex-col">
      <div className={`${styleClasses.flexWrap1000}`}>
        <div className={`${styleClasses.mapContainer}`}>
          <KiteSpotsMap />
        </div>
        <div className={`${styleClasses.descriptionContainer} bg-white`} >
          <Image src={image ? image : ""} alt="Beach Wind Directions" style={{ width: '54vh' }} />
          <div className="bg-white p-5 flex flex-col gap-12 justify-center">
            <p className={"font-bold text-3xl"}>{nameId ? (nameId?.charAt(0).toUpperCase() + nameId?.slice(1).toLowerCase()) : undefined} Beach</p>
            <div className={styleClasses.textList}>
              <ul className="flex flex-col justify-center ">
                <li>
                  Side Onshore - Ideal
                  <span className={styleClasses.square} style={{ backgroundColor: '#00bb00' }}></span>
                </li>
                <li>
                  Onshore - Hard for beginners
                  <span className={styleClasses.square} style={{ backgroundColor: '#008000' }}></span>
                </li>
                <li>
                  Over land - Gusty
                  <span className={styleClasses.square} style={{ backgroundColor: '#45a3ff' }}></span>
                </li>
                <li>
                  Side Offshore - Dangerous
                  <span className={styleClasses.square} style={{ backgroundColor: '#ffa500' }}></span>
                </li>
                <li>
                  Offshore - Very Dangerous
                  <span className={styleClasses.square} style={{ backgroundColor: '#FD0100' }}></span>
                </li>
              </ul>
            </div>
            <div>
              <ul>
                <li className="flex flex-row gap-2">
                  <p>Beginner:</p>
                  <StarRating score={beginnerScore ? beginnerScore : 0} />
                </li>
                <li className="flex flex-row gap-2">
                  <p>Freestyle:</p>
                  <StarRating score={freestyleScore ? freestyleScore : 0} />
                </li>
                <li className="flex flex-row gap-2">
                  <p>Wave:</p>
                  <StarRating score={waveScore ? waveScore : 0} />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div  className={`${styleClasses.bottomCraphContainer}`}>
        {(windSpeed10ms && precipitation) && (
          <div className={`${styleClasses.windVsRainGraph as string}`}>
            <WindVsRain data={{ windSpeed: windSpeed10ms[0].dates, precipitation: precipitation[0].dates }} />
          </div>
        )}
        {windDirection10ms && windDirection10ms[0] && (
          <div className={`${styleClasses.windDirectionGraph as string} p-5`}>
            <WindDirection data={windDirection10ms[0].dates} />
          </div>
        )}
      </div>
    </div>
  )
}
