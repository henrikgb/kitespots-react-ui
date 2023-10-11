// src/Repository/blobRepository.ts
import { WeatherDataDTO, HourlyForecastDTO, DailyForecastDTO } from './dataTransferObjects';
import { RawWeatherData, RawHourlyData, RawDailyData } from './rawWeatherDataTypes';
import {convertTimestampToDateStr} from "@/util/ConvertTimestampToDateStr";


const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'weatherdata';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export const fetchWeatherData = async (): Promise<WeatherDataDTO> => {
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const blobClient = containerClient.getBlobClient('latestWeatherData.json');
  const blobContent = await blobClient.downloadToBuffer();
  const rawData: RawWeatherData = JSON.parse(blobContent.toString('utf-8'));

  // Extract and transform data
  const hourly: HourlyForecastDTO[] = rawData.hourly.map((hour: RawHourlyData) => ({
    time: convertTimestampToDateStr(hour.dt),
    windSpeed: hour.wind_speed,
    windDirection: hour.wind_deg,
    rainProbability: hour.pop
  }));

  const daily: DailyForecastDTO[] = rawData.daily.map((day: RawDailyData) => ({
    time: convertTimestampToDateStr(day.dt),
    windSpeed: day.wind_speed,
    windDirection: day.wind_deg,
    rainProbability: day.pop
  }));

  return { hourly, daily };
};

module.exports = {
  fetchWeatherData
};
