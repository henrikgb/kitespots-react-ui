import {useEffect} from "react";
import axios from "axios";
import {useMeteomaticsWeatherDataStore} from "@/store/meteomaticsWeatherDataStore";

/**
 * This hook fetches weather data from blob storage in Azure.
 * The weather data in blob storage is updated once per hour by a function app that fetches data
 * from the Meteomatics API. The hook fetches data for all the available locations, but sets the default
 * selected location to Selestranden. When the user selects a location on the map setSelectedLocation will update
 * a new location to be in focus and displayed in the weather charts.
 */
export function useMeteomaticsWeatherData() {
  const { setMeteomaticsData,
    setSelectedLocation, setIsMeteomaticsDataLoading} = useMeteomaticsWeatherDataStore();

  useEffect(() => {
    axios.get('/api/meteomaticsData')
      .then((response) => {
        const data = response.data.data;
        setMeteomaticsData(data);
        setSelectedLocation("SELE"); // Set default location to Selestranden
        setIsMeteomaticsDataLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching Meteomatics data:', error);
      });
  }, [setIsMeteomaticsDataLoading, setMeteomaticsData, setSelectedLocation]);
}