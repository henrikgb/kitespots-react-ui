/**
 * Provider-independent location contract. This is the exact shape stored at
 * locations.json in Blob Storage by the Function App, except `imageBlobName` (a blob name
 * in the public "location-images" container, e.g. "location-images/sande.png") is resolved
 * server-side into `imageUrl` (a public, directly-fetchable Blob Storage URL) so components
 * never need to know the storage account name or blob container layout.
 */
export interface KiteSpotLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Undefined when the location has no imageBlobName yet (e.g. it was just added). */
  imageUrl: string | undefined;
  beginnerScore: number;
  freestyleScore: number;
  waveScore: number;
  windDirectionDescriptions: WindDirectionDescription[];
}

export interface WindDirectionDescription {
  intervalStart: number;
  intervalStop: number;
  category: string;
  colorCode: string;
}

/**
 * The raw, on-disk shape of one location as written to locations.json - as opposed to
 * KiteSpotLocation, which is the resolved shape returned to the browser. Used for admin
 * read-modify-write operations (add/delete), where the exact persisted fields matter (e.g.
 * `imageBlobName`, not the resolved `imageUrl`).
 */
export interface LocationRecord {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageBlobName?: string;
  beginnerScore?: number;
  freestyleScore?: number;
  waveScore?: number;
  windDirectionDescriptions: WindDirectionDescription[];
}

export interface LocationsDocument {
  schemaVersion: number;
  locations: LocationRecord[];
}

/**
 * Builds the public, read-only Blob Storage URL for a location's image
 * (e.g. "location-images/sande.png" -> "https://<account>.blob.core.windows.net/location-images/sande.png").
 *
 * The "location-images" container is configured for anonymous *read* access to individual
 * blobs only (public access level "blob" - no container listing); write access always
 * requires the storage account connection string, which never leaves the server (see
 * scripts/migrate-location-images.mjs). Serving these specific images this way is safe
 * because they are public, non-sensitive marketing photos - unlike locations.json/weather
 * data, which stay behind the /api/locations and /api/weatherData routes.
 */
export const getLocationImageUrl = (imageBlobName: string): string =>
  `${process.env.AZURE_BLOB_PUBLIC_BASE_URL}/${imageBlobName}`;
