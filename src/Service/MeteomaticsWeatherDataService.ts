import {fetchMeteomaticsWeatherData} from "@/Repository/MeteomaticsWeatherDataRepository";
import {MeteomaticsWeatherData} from "@/types/model/MeteomaticsWeatherData";

export const getMeteomaticsWeatherData = async(): Promise<MeteomaticsWeatherData[]> => {
  return await fetchMeteomaticsWeatherData();
}

module.exports = {
  getMeteomaticsWeatherData
}