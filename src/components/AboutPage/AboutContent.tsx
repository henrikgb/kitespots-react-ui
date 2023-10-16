import React, { useEffect, useState } from "react";
import useThemeStore from "@/store/themeStore";
import { useTranslation } from "next-i18next";
import axios from 'axios';
import WindVsRain from "@/components/Charts/WindVsRain";

export function AboutContent() {
  const [hourlyData, setHourlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  useEffect(() => {
    axios.get('/api/data')
      .then((response) => {
        const { hourly, daily } = response.data.data;  // Destructure the hourly and daily data

        setHourlyData(hourly);
        setDailyData(daily);

        console.log("Hourly Data:", hourly);
        console.log("Daily Data:", daily);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-3xl"}>{t("weatherDataFromOpenWeatherMap")}</p>
      {hourlyData && dailyData ? (
        <div className="flex flex-col gap-8">
          <p>{t("updatedDataStoredInAzure")}</p>
          <div style={{ height: "400px" }}>
            <WindVsRain data={hourlyData}/>
          </div>
        </div>
      ) : (
        <>
          <br/>
          <p>Loading data...</p>
        </>
      )}
    </div>
  )
}
