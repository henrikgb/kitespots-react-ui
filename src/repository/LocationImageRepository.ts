const { BlobServiceClient } = require('@azure/storage-blob');

const LOCATIONS_AZURE_BLOB_CONTAINER = "weatherdata";
const ALLOWED_IMAGE_PATH_PREFIX = "location-images/";

export interface LocationImage {
  contentType: string;
  data: Buffer;
}

/**
 * Location images are only ever served from the location-images/ prefix of the
 * weatherdata container - this stops the image route from being usable as a generic
 * blob-read proxy for e.g. locations.json or weather/*.json.
 */
export const isAllowedLocationImagePath = (blobPath: string): boolean =>
  blobPath.startsWith(ALLOWED_IMAGE_PATH_PREFIX) && !blobPath.includes("..");

const streamToBuffer = async (readable: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

/**
 * Fetches a location image from Blob Storage. Returns null both when the path is
 * disallowed and when the blob simply doesn't exist yet (e.g. a newly added location
 * that hasn't had its image uploaded) - either way, the caller should respond 404.
 */
export const fetchLocationImage = async (blobPath: string): Promise<LocationImage | null> => {
  if (!isAllowedLocationImagePath(blobPath)) {
    return null;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATIONS_AZURE_BLOB_CONTAINER);
  const blobClient = containerClient.getBlobClient(blobPath);

  const exists = await blobClient.exists();
  if (!exists) {
    return null;
  }

  const downloadResponse = await blobClient.download();
  const data = await streamToBuffer(downloadResponse.readableStreamBody);
  return { contentType: downloadResponse.contentType ?? "application/octet-stream", data };
};
