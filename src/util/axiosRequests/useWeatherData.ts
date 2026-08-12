import {useEffect} from "react";
import axios from "axios";
import {useWeatherDataStore} from "@/store/weatherDataStore";

/**
 * This hook fetches weather data from blob storage in Azure.
 * The weather data in blob storage is updated once per hour by a function app that fetches data
 * from the Yr / MET Norway API. The hook fetches data for all available locations; which
 * location's series are shown is driven by weatherDataStore.selectedLocation, whose default
 * is set by useLocations once the location catalog has loaded.
 */
export function useWeatherData() {
  const { setWeatherData, setIsWeatherDataLoading } = useWeatherDataStore();

  useEffect(() => {
    axios.get('/api/weatherData')
      .then((response) => {
        const data = response.data.data;
        setWeatherData(data);
        setIsWeatherDataLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
        setIsWeatherDataLoading(false);
      });
  }, [setIsWeatherDataLoading, setWeatherData]);
}
