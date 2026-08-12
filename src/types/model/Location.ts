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
