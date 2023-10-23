import Image from "next/image";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";
import WindDirection from "@/components/Charts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";

export default function Home() {
  const [hourlyData, setHourlyData] = useState(null);
  const {nameId,
    image,
    beginnerScore,
    freestyleScore,
    waveScore} = useBeachDescriptionStore();

  useEffect(() => {
    axios.get('/api/data')
      .then((response) => {
        const { hourly } = response.data.data;  // Destructure the hourly and daily data
        setHourlyData(hourly);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
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
            <p className={"font-bold text-3xl"}>{nameId} Beach</p>
            <div className={`${styleClasses.textList}`}>
              <li>Side Onshore - Ideal</li>
              <li>Onshore - Hard for beginners</li>
              <li>Over land - Gusty</li>
              <li>Side Offshore - Dangerous</li>
              <li>Offshore - Very Dangerous</li>
            </div>
            <div>
              <li>Beginner: {beginnerScore}</li>
              <li>Freestyle: {freestyleScore}</li>
              <li>Wave: {waveScore}</li>
            </div>
          </div>
        </div>
      </div>
      <div  className={`${styleClasses.bottomCraphContainer}`}>
        {hourlyData && (
          <div className={`${styleClasses.windVsRainGraph as string}`}>
            <WindVsRain data={hourlyData} />
          </div>
        )}
        {hourlyData && (
          <div className={`${styleClasses.windDirectionGraph as string} p-5`}>
            <WindDirection data={hourlyData} />
          </div>
        )}
      </div>
    </div>
  )
}
