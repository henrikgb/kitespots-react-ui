import React, {useEffect, useState} from "react";
import useThemeStore from "@/store/themeStore";
import {useTranslation} from "next-i18next";

export function AboutContent() {
  const [data, setData] = useState(null);
  const {theme} = useThemeStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  return (
    <div className={`text-container ${theme}`}>
      <p className={"font-bold text-3xl"}>{t("weatherDataFromOpenWeatherMap")}</p>
      {data ? (
        <div className="flex flex-col gap-8">
          <p>{t("updatedDataStoredInAzure")}</p>
          <p>{data}</p>
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