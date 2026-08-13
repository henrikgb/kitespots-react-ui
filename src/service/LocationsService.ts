import {
  downloadLocationsDocument,
  fetchLocations,
  LocationsDocumentCorruptError,
  LocationsDocumentSnapshot,
  LocationsWriteConflictError,
  uploadLocationsDocument,
} from "@/repository/LocationsRepository";
import { deleteLocationImage, uploadLocationImage } from "@/repository/LocationImagesRepository";
import { deleteWeatherData } from "@/repository/WeatherDataRepository";
import { KiteSpotLocation, LocationRecord, LocationsDocument, getLocationImageUrl } from "@/types/model/Location";
import {
  NewLocationInput,
  generateLocationId,
  getImageExtensionForMimeType,
  isDuplicateLocationName,
  isValidLocationId,
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

/**
 * Loads locations.json for a read-modify-write, translating the repository's low-level
 * corruption signal into an HTTP-facing error. A corrupt document is a data-integrity problem
 * that needs manual attention, not something an admin action can be blamed for or retried past.
 */
const loadLocationsDocumentForUpdate = async (): Promise<LocationsDocumentSnapshot> => {
  try {
    return await downloadLocationsDocument();
  } catch (error) {
    if (error instanceof LocationsDocumentCorruptError) {
      throw new LocationServiceError(
        "locations.json is corrupted and could not be safely read. Manual intervention is required before further edits.",
        500
      );
    }
    throw error;
  }
};

/**
 * Writes locations.json back, translating an ETag/If-None-Match mismatch (someone else's write
 * landed first - see LocationsRepository) into a 409 the API layer can surface to the admin
 * instead of one edit silently clobbering the other. Deliberately does not retry: this is a
 * low-concurrency admin feature, so asking the caller to re-read and resubmit is simpler and
 * safer than an automatic merge/retry loop.
 */
const saveLocationsDocument = async (document: LocationsDocument, etag: string | null): Promise<void> => {
  try {
    await uploadLocationsDocument(document, etag);
  } catch (error) {
    if (error instanceof LocationsWriteConflictError) {
      throw new LocationServiceError(
        "The locations list was changed by someone else while this edit was in progress. Reload and try again.",
        409
      );
    }
    throw error;
  }
};

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

  const { document, etag } = await loadLocationsDocumentForUpdate();

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
  await saveLocationsDocument(document, etag);

  return toKiteSpotLocation(record);
};

/**
 * Removes a location from locations.json - the single source of truth - and cleans up both
 * its image and its weather/{id}.json blob so neither can reappear as an orphaned "phantom"
 * location. Best-effort on the blob cleanup: locations.json is updated first so the location
 * disappears from the frontend immediately even if a blob delete below fails.
 */
export const deleteLocation = async (id: string): Promise<void> => {
  // Defense in depth: id ends up in Blob Storage paths (target.imageBlobName is trusted, but
  // `weather/${id}.json` below is built directly from it) - reject anything that isn't a
  // server-generated-looking slug before it can reach a blob operation, even though a
  // non-matching id would 404 below anyway. See isValidLocationId.
  if (!isValidLocationId(id)) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  const { document, etag } = await loadLocationsDocumentForUpdate();
  const target = document.locations.find((location) => location.id === id);

  if (!target) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  document.locations = document.locations.filter((location) => location.id !== id);
  await saveLocationsDocument(document, etag);

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

  // Defense in depth: id is used directly below to build the uploaded blob's name - reject
  // anything that isn't a server-generated-looking slug before it can reach a blob operation.
  // See isValidLocationId / deleteLocation.
  if (!isValidLocationId(id)) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  const { document, etag } = await loadLocationsDocumentForUpdate();
  const target = document.locations.find((location) => location.id === id);

  if (!target) {
    throw new LocationServiceError(`No location with id "${id}" exists.`, 404);
  }

  const extension = getImageExtensionForMimeType(contentType as string) as string;
  const blobName = `location-images/${id}.${extension}`;

  await uploadLocationImage(blobName, data, contentType as string);

  target.imageBlobName = blobName;

  try {
    await saveLocationsDocument(document, etag);
  } catch (error) {
    // The image blob now exists in Blob Storage but locations.json was never updated to point
    // at it. Its name is fully determined by the location id + extension (see blobName above),
    // so a retry of this same call would just overwrite it harmlessly - but if the admin doesn't
    // retry, best-effort delete it now rather than leaving a permanent orphan behind. This is
    // not a distributed transaction: if the cleanup delete itself fails, we log and move on
    // rather than compounding the failure.
    await deleteLocationImage(blobName).catch((cleanupError) => {
      console.error(`Failed to clean up orphaned image blob "${blobName}" after a failed locations.json update:`, cleanupError);
    });
    throw error;
  }

  return toKiteSpotLocation(target);
};
