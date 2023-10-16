import React, {useEffect, useState} from "react";
import axios from "axios";
import {KiteSpotsMap} from "@/components/MapPage/KiteSpotsMap";
import WindVsRain from "@/components/Charts/WindVsRain";
import styleClasses from "@/pages/index.module.css";

export default function Home() {
  const [hourlyData, setHourlyData] = useState(null);

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
        <div className={`${styleClasses.graphContainer}`} >
                PLACEOLDER GRAPH WIND DIRECTION
        </div>
      </div>
      <div  className={`${styleClasses.bottomCraphContainer}`}>
        {hourlyData && <WindVsRain data={hourlyData} />}
      </div>
    </div>
  )
}
