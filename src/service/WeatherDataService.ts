import { fetchWeatherData } from "@/repository/WeatherDataRepository";
import { WeatherData } from "@/types/model/WeatherData";

export const getWeatherData = async (): Promise<WeatherData[]> => {
  return await fetchWeatherData();
};
