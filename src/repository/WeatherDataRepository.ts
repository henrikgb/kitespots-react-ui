import { WeatherData } from "@/types/model/WeatherData";
import { fetchLocations } from "@/repository/LocationsRepository";
const { BlobServiceClient } = require('@azure/storage-blob');

const WEATHER_AZURE_BLOB_CONTAINER = "weatherdata";

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

/**
 * Filters Promise.allSettled results down to just the successfully fetched weather data,
 * warning (not throwing) for each location whose blob failed to fetch - most commonly
 * because a newly added location doesn't have its first weather/{locationId}.json blob
 * yet. Kept as a pure function (no Azure SDK calls) so it can be unit tested in isolation.
 */
export const collectAvailableWeatherData = (
  results: PromiseSettledResult<WeatherData>[],
  locationIds: string[]
): WeatherData[] => {
  const weatherData: WeatherData[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      weatherData.push(result.value);
    } else {
      console.warn(`No weather data available yet for location "${locationIds[index]}":`, result.reason);
    }
  });
  return weatherData;
};

/**
 * Fetches weather data for every known location. A location that exists in locations.json
 * but has no weather/{locationId}.json blob yet (e.g. it was just added and the Function
 * App hasn't produced its first forecast) is expected and not an error - it is simply
 * omitted from the result rather than failing the whole request.
 */
export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  const locations = await fetchLocations();
  if (locations.length === 0) {
    return [];
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(WEATHER_AZURE_BLOB_CONTAINER);

  const results = await Promise.allSettled(
    locations.map(async (location) => {
      const blobClient = containerClient.getBlobClient(`weather/${location.id}.json`);
      const blobContent = await blobClient.downloadToBuffer();
      return parseWeatherDataBlob(blobContent.toString('utf-8'));
    })
  );

  return collectAvailableWeatherData(results, locations.map((location) => location.id));
};
