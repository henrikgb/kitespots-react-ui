import { fetchWeatherData } from "@/Repository/blobRepository";

export const getWeatherData = async () => {
  return await fetchWeatherData();
};

module.exports = {
  getWeatherData
};
