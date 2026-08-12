const { BlobServiceClient } = require('@azure/storage-blob');

const LOCATION_IMAGES_CONTAINER = "location-images";
const LOCATION_IMAGES_CONTAINER_PREFIX = `${LOCATION_IMAGES_CONTAINER}/`;

/**
 * Callers pass blobName as the full "location-images/..." path (matching the imageBlobName
 * convention used throughout the app - see Location.ts), but the blob client below is already
 * scoped to the "location-images" container, so that prefix must be stripped here. Otherwise
 * the blob ends up nested at location-images/location-images/... instead of alongside the
 * other images.
 */
export const toBlobKey = (blobName: string): string =>
  blobName.startsWith(LOCATION_IMAGES_CONTAINER_PREFIX)
    ? blobName.slice(LOCATION_IMAGES_CONTAINER_PREFIX.length)
    : blobName;

/**
 * Uploads a kite spot image to the public "location-images" container (see Phase 5 /
 * scripts/migrate-location-images.mjs for the read side - public blob-level access, write
 * always requires this connection string, never exposed to the browser). Creates the
 * container with public blob access if it doesn't exist yet, so this also works against a
 * brand-new storage account.
 */
export const uploadLocationImage = async (blobName: string, data: Buffer, contentType: string): Promise<void> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATION_IMAGES_CONTAINER);
  await containerClient.createIfNotExists({ access: "blob" });

  const blockBlobClient = containerClient.getBlockBlobClient(toBlobKey(blobName));
  await blockBlobClient.upload(data, data.length, {
    overwrite: true,
    blobHTTPHeaders: { blobContentType: contentType },
  });
};

/** Deletes a kite spot image if it exists. A no-op (not an error) if it's already gone. */
export const deleteLocationImage = async (blobName: string): Promise<void> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATION_IMAGES_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(toBlobKey(blobName));
  await blockBlobClient.deleteIfExists();
};
