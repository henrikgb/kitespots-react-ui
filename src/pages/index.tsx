import Image from "next/image";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";
import WindDirection from "@/components/Charts/WindDirection";
import useBeachDescriptionStore from "@/store/beachDescriptionStore";
import {StarRating} from "@/util/StarRating";

export default function Home() {
  const [meteomaticsData, setMeteomaticsData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const {
    nameId,
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

    axios.get('/api/meteomaticsData')
      .then((response) => {
        const data = response.data.data;
        setMeteomaticsData(data);
        console.log('Meteomatics data:', data);
      })
      .catch((error) => {
        console.error('Error fetching Meteomatics data:', error);
      });
  }, []);

  console.log(meteomaticsData);

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
