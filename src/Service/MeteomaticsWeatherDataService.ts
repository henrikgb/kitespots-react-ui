import {fetchMeteomaticsWeatherData} from "@/Repository/MeteomaticsWeatherDataRepository";
import {MeteomaticsWeatherData} from "@/model/MeteomaticsWeatherData";

export const getMeteomaticsWeatherData = async(): Promise<MeteomaticsWeatherData[]> => {
  return await fetchMeteomaticsWeatherData();
}

module.exports = {
  getMeteomaticsWeatherData
}