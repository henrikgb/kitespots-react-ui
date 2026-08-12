const { BlobServiceClient } = require('@azure/storage-blob');

const LOCATION_IMAGES_CONTAINER = "location-images";

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

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(data, data.length, {
    overwrite: true,
    blobHTTPHeaders: { blobContentType: contentType },
  });
};

/** Deletes a kite spot image if it exists. A no-op (not an error) if it's already gone. */
export const deleteLocationImage = async (blobName: string): Promise<void> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATION_IMAGES_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};
