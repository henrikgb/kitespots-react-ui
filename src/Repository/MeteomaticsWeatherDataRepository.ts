import {AZURE_KITESPOTSAD77_CONNECTION_STRING} from "@/util/apiClient/endpoints";
import {MeteomaticsWeatherData} from "@/model/MeteomaticsWeatherData";
import {MeteomaticsJsonResponseDTO} from "@/Repository/dto/MeteomaticsJsonResponseDTO";
const { BlobServiceClient } = require('@azure/storage-blob');

const METEOMATICS_AZURE_BLOB_CONTAINER = "weatherdata";

const blobClients = {
  BORE: "Bore_MeteomaticsWeatherData.json",
  BRUSAND: "Brusand_MeteomaticsWeatherData.json",
  HELLESTO: "Hellesto_MeteomaticsWeatherData.json",
  ORRE: "Orre_MeteomaticsWeatherData.json",
  REFSNES: "Refsnes_MeteomaticsWeatherData.json",
  SANDE: "Sande_MeteomaticsWeatherData.json",
  SELE: "Sele_MeteomaticsWeatherData.json",
  SOLA: "Sola_MeteomaticsWeatherData.json",
  X: "X_MeteomaticsWeatherData.json",
};

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_KITESPOTSAD77_CONNECTION_STRING);

export const fetchMeteomaticsWeatherData = async (): Promise<MeteomaticsWeatherData[]> => {
  const containerClient = blobServiceClient.getContainerClient(METEOMATICS_AZURE_BLOB_CONTAINER);
  const weatherDataPromises = Object.entries(blobClients).map(async ([locationName, blobName]) => {
    const blobClient = containerClient.getBlobClient(blobName);
    const blobContent = await blobClient.downloadToBuffer();
    const rawData: MeteomaticsJsonResponseDTO = JSON.parse(blobContent.toString('utf-8'));

    // Transform rawData to MeteomaticsWeatherData
    const transformedData: MeteomaticsWeatherData = transformRawDataToWeatherData(rawData, locationName);
    return transformedData;
  });

  return Promise.all(weatherDataPromises);
};

const transformRawDataToWeatherData = (rawData: MeteomaticsJsonResponseDTO, locationName: string): MeteomaticsWeatherData => {
  const windSpeed10ms = rawData.data.find(item => item.parameter === "wind_speed_10m:ms")?.coordinates[0].dates.map(dateValue => ({
    date: dateValue.date,
    value: dateValue.value
  })) || [];

  const windDirection10ms = rawData.data.find(item => item.parameter === "wind_dir_10m:d")?.coordinates[0].dates.map(dateValue => ({
    date: dateValue.date,
    value: dateValue.value
  })) || [];

  const WindGusts10ms = rawData.data.find(item => item.parameter === "wind_gusts_10m_1h:ms")?.coordinates[0].dates.map(dateValue => ({
    date: dateValue.date,
    value: dateValue.value
  })) || [];

  const Precipitation = rawData.data.find(item => item.parameter === "precip_1h:mm")?.coordinates[0].dates.map(dateValue => ({
    date: dateValue.date,
    value: dateValue.value
  })) || [];

  return {
    locationName,
    windSpeed10ms: [{ dates: windSpeed10ms }],
    windDirection10ms: [{ dates: windDirection10ms }],
    windGusts10ms: [{ dates: WindGusts10ms }],
    precipitation: [{ dates: Precipitation }],
  };
};

module.exports = {
  fetchMeteomaticsWeatherData
};