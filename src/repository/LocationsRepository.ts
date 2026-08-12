import { KiteSpotLocation, WindDirectionDescription, getLocationImageUrl } from "@/types/model/Location";
const { BlobServiceClient } = require('@azure/storage-blob');

const LOCATIONS_AZURE_BLOB_CONTAINER = "weatherdata";
const LOCATIONS_BLOB_NAME = "locations.json";

interface RawLocation {
  id: unknown;
  name: unknown;
  latitude: unknown;
  longitude: unknown;
  image: unknown;
  beginnerScore?: unknown;
  freestyleScore?: unknown;
  waveScore?: unknown;
  windDirectionDescriptions?: unknown;
}

const isValidWindDirectionDescription = (value: unknown): value is WindDirectionDescription => {
  const d = value as WindDirectionDescription;
  return (
    !!d &&
    typeof d.intervalStart === "number" &&
    typeof d.intervalStop === "number" &&
    typeof d.category === "string" &&
    typeof d.colorCode === "string"
  );
};

const isValidRawLocation = (value: unknown): value is RawLocation => {
  const l = value as RawLocation;
  return (
    !!l &&
    typeof l.id === "string" && l.id.length > 0 &&
    typeof l.name === "string" && l.name.length > 0 &&
    typeof l.latitude === "number" && l.latitude >= -90 && l.latitude <= 90 &&
    typeof l.longitude === "number" && l.longitude >= -180 && l.longitude <= 180 &&
    typeof l.image === "string" &&
    (l.windDirectionDescriptions === undefined ||
      (Array.isArray(l.windDirectionDescriptions) && l.windDirectionDescriptions.every(isValidWindDirectionDescription)))
  );
};

const toKiteSpotLocation = (raw: RawLocation): KiteSpotLocation => ({
  id: raw.id as string,
  name: raw.name as string,
  latitude: raw.latitude as number,
  longitude: raw.longitude as number,
  imageUrl: getLocationImageUrl(raw.image as string),
  beginnerScore: typeof raw.beginnerScore === "number" ? raw.beginnerScore : 0,
  freestyleScore: typeof raw.freestyleScore === "number" ? raw.freestyleScore : 0,
  waveScore: typeof raw.waveScore === "number" ? raw.waveScore : 0,
  windDirectionDescriptions: Array.isArray(raw.windDirectionDescriptions)
    ? raw.windDirectionDescriptions as WindDirectionDescription[]
    : [],
});

/**
 * Parses and validates a locations.json blob. The document itself must be well-formed
 * (an object with a `locations` array), but individual malformed entries are skipped
 * rather than failing the whole request - mirrors the Function App's LocationValidator,
 * which likewise tolerates individual bad locations but rejects a broken document.
 * Kept as a pure function (no Azure SDK calls) so it can be unit tested in isolation.
 */
export const parseLocationsBlob = (rawJson: string): KiteSpotLocation[] => {
  const parsed = JSON.parse(rawJson);

  if (!parsed || !Array.isArray(parsed.locations)) {
    throw new Error("Locations blob does not match the expected LocationsDocument contract.");
  }

  const validRawLocations = (parsed.locations as unknown[]).filter(isValidRawLocation);

  const seenIds = new Set<string>();
  for (const location of validRawLocations) {
    const key = (location.id as string).toLowerCase();
    if (seenIds.has(key)) {
      throw new Error(`Locations blob contains duplicate location id: ${location.id}`);
    }
    seenIds.add(key);
  }

  return validRawLocations.map(toKiteSpotLocation);
};

export const fetchLocations = async (): Promise<KiteSpotLocation[]> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATIONS_AZURE_BLOB_CONTAINER);
  const blobClient = containerClient.getBlobClient(LOCATIONS_BLOB_NAME);

  const blobContent = await blobClient.downloadToBuffer();
  return parseLocationsBlob(blobContent.toString('utf-8'));
};
