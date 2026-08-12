/**
 * Provider-independent location contract. This is the exact shape stored at
 * locations.json in Blob Storage by the Function App, except `image` (a blob-relative
 * path such as "location-images/sande.png") is resolved server-side into `imageUrl`
 * (a same-origin proxy URL) so components never need to know the blob storage layout.
 */
export interface KiteSpotLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
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

const LOCATION_IMAGE_ROUTE_PREFIX = "/api/locationImage/";

/**
 * Builds the same-origin proxy URL for a location's blob-relative image path
 * (e.g. "location-images/sande.png" -> "/api/locationImage/location-images/sande.png").
 * Client-safe (no Azure SDK) so it can be shared between the server (LocationsRepository)
 * and the API route that reconstructs the blob path from the URL.
 */
export const getLocationImageUrl = (imageBlobPath: string): string =>
  `${LOCATION_IMAGE_ROUTE_PREFIX}${imageBlobPath}`;
