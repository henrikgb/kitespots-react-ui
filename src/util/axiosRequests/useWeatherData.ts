import {useEffect} from "react";
import axios from "axios";
import {useWeatherDataStore} from "@/store/weatherDataStore";

/**
 * This hook fetches weather data from blob storage in Azure.
 * The weather data in blob storage is updated once per hour by a function app that fetches data
 * from the Yr / MET Norway API. The hook fetches data for all the available locations, but sets the default
 * selected location to Selestranden. When the user selects a location on the map setSelectedLocation will update
 * a new location to be in focus and displayed in the weather dataCharts.
 */
export function useWeatherData() {
  const { setWeatherData,
    setSelectedLocation, setIsWeatherDataLoading} = useWeatherDataStore();

  useEffect(() => {
    axios.get('/api/weatherData')
      .then((response) => {
        const data = response.data.data;
        setWeatherData(data);
        setSelectedLocation("sele"); // Set default location to Selestranden
        setIsWeatherDataLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });
  }, [setIsWeatherDataLoading, setWeatherData, setSelectedLocation]);
}
