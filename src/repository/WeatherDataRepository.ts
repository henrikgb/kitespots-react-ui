import { WeatherData } from "@/types/model/WeatherData";
import { beachCoordinates } from "@/assets/beachCoordinates";
const { BlobServiceClient } = require('@azure/storage-blob');

const WEATHER_AZURE_BLOB_CONTAINER = "weatherdata";

// Provider-independent, lowercase location ids - derived from the existing beach
// coordinates rather than a second hardcoded list, so this can't drift out of sync.
const locationIds = beachCoordinates.map((coordinate) => coordinate.nameId.toLowerCase());

/**
 * Parses and validates a weather/{locationId}.json blob against the WeatherData contract.
 * Kept as a pure function (no Azure SDK calls) so it can be unit tested in isolation.
 */
export const parseWeatherDataBlob = (rawJson: string): WeatherData => {
  const parsed = JSON.parse(rawJson);

  if (
    !parsed ||
    typeof parsed.locationId !== "string" ||
    typeof parsed.generatedAt !== "string" ||
    !Array.isArray(parsed.points)
  ) {
    throw new Error("Weather data blob does not match the expected WeatherData contract.");
  }

  return parsed as WeatherData;
};

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(WEATHER_AZURE_BLOB_CONTAINER);

  const weatherDataPromises = locationIds.map(async (locationId: string) => {
    const blobClient = containerClient.getBlobClient(`weather/${locationId}.json`);
    const blobContent = await blobClient.downloadToBuffer();
    return parseWeatherDataBlob(blobContent.toString('utf-8'));
  });

  return Promise.all(weatherDataPromises);
};
