import {
  downloadLocationsDocument,
  fetchLocations,
  uploadLocationsDocument,
} from "@/repository/LocationsRepository";
import { deleteLocationImage, uploadLocationImage } from "@/repository/LocationImagesRepository";
import { deleteWeatherData } from "@/repository/WeatherDataRepository";
import { KiteSpotLocation, LocationRecord, getLocationImageUrl } from "@/types/model/Location";
import {
  NewLocationInput,
  generateLocationId,
  getImageExtensionForMimeType,
  isDuplicateLocationName,
  validateImageUpload,
  validateNewLocationInput,
} from "@/domain/locationValidation";

/** Thrown for any create/delete/image-attach failure the API route should map to an HTTP status. */
export class LocationServiceError extends Error {
  readonly statusCode: number;
  readonly errors: string[];

  constructor(message: string, statusCode: number, errors: string[] = [message]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const toKiteSpotLocation = (record: LocationRecord): KiteSpotLocation => ({
  id: record.id,
  name: record.name,
  latitude: record.latitude,
  longitude: record.longitude,
  imageUrl: record.imageBlobName ? getLocationImageUrl(record.imageBlobName) : undefined,
  beginnerScore: record.beginnerScore ?? 0,
  freestyleScore: record.freestyleScore ?? 0,
  waveScore: record.waveScore ?? 0,
  windDirectionDescriptions: record.windDirectionDescriptions,
});

export const getLocations = async (): Promise<KiteSpotLocation[]> => {
  return await fetchLocations();
};

/**
 * Validates and appends a new location to locations.json. The id is always generated here
 * server-side (see generateLocationId) - a client-supplied id is never trusted. Image upload
 * is a separate step (attachLocationImage) once the caller has the generated id, so a location
 * can exist - and appear in the frontend - before it has an image, exactly like it can exist
 * before its first weather blob.
 */
export const createLocation = async (input: NewLocationInput): Promise<KiteSpotLocation> => {
  const validation = validateNewLocationInput(input);
  if (!validation.valid || !validation.data) {
    throw new LocationServiceError("Invalid location input.", 400, validation.errors);
  }

  const document = await downloadLocationsDocument();

  if (isDuplicateLocationName(validation.data.name, document.locations.map((location) => location.name))) {
    throw new LocationServiceError(`A location named "${validation.data.name}" already exists.`, 409);
  }

  const id = generateLocationId(validation.data.name, document.locations.map((location) => location.id));

  const record: LocationRecord = {
    id,
    name: validation.data.name,
    latitude: validation.data.latitude,
    longitude: validation.data.longitude,
    beginnerScore: validation.data.beginnerScore,
    freestyleScore: validation.data.freestyleScore,
    waveScore: validation.data.waveScore,
    windDirectionDescriptions: validation.data.windDirectionDescriptions,
  };

  document.locations.push(record);
  await uploadLocationsDocument(document);

  return toKiteSpotLocation(record);
};

/**
 * Removes a location from locations.json - the single source of truth - and cleans up both
 * its image and its weather/{id}.json blob so neither can reappear as an orphaned "phantom"
 * location. Best-effort on the blob cleanup: locations.json is updated first so the location
 * disappears from the frontend immediately even if a blob delete below fails.
 */
export const deleteLocation = async (id: string): Promise<void> => {
  const document = await downloadLocationsDocument();
  const target = document.locations.find((location) => location.id === id);

  if (!target) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  document.locations = document.locations.filter((location) => location.id !== id);
  await uploadLocationsDocument(document);

  await Promise.all([
    target.imageBlobName ? deleteLocationImage(target.imageBlobName) : Promise.resolve(),
    deleteWeatherData(id),
  ]);
};

/**
 * Uploads and attaches an image to an existing location. The blob name is always derived
 * server-side from the already-validated location id plus a server-controlled extension for
 * the validated MIME type (see getImageExtensionForMimeType) - never from a client-supplied
 * filename or path, so a client can't influence where in Blob Storage anything gets written.
 */
export const attachLocationImage = async (
  id: string,
  data: Buffer,
  contentType: string | undefined
): Promise<KiteSpotLocation> => {
  const imageErrors = validateImageUpload(contentType, data.length);
  if (imageErrors.length > 0) {
    throw new LocationServiceError("Invalid image upload.", 400, imageErrors);
  }

  const document = await downloadLocationsDocument();
  const target = document.locations.find((location) => location.id === id);

  if (!target) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  const extension = getImageExtensionForMimeType(contentType as string) as string;
  const blobName = `location-images/${id}.${extension}`;

  await uploadLocationImage(blobName, data, contentType as string);

  target.imageBlobName = blobName;
  await uploadLocationsDocument(document);

  return toKiteSpotLocation(target);
};
