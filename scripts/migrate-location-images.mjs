#!/usr/bin/env node
/**
 * One-off / re-runnable migration: uploads the kite spot images that used to be bundled as
 * static frontend assets (src/assets/images/*.png) into the "location-images" Blob Storage
 * container, at the blob names referenced by locations.json's `imageBlobName` field.
 *
 * Usage:
 *   node scripts/migrate-location-images.mjs           # upload anything missing
 *   node scripts/migrate-location-images.mjs --force   # re-upload even if the blob already exists
 *
 * Requires AZURE_KITESPOTSAD77_CONNECTION_STRING (see .env) - the same connection string
 * already used by LocationsRepository/WeatherDataRepository. Write access is only ever used
 * from this script / the Function App, never from browser or Next.js request-handling code.
 */
import { BlobServiceClient } from "@azure/storage-blob";
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "..", ".env") });

const CONTAINER_NAME = "location-images";
const IMAGES_DIR = path.resolve(__dirname, "..", "src", "assets", "images");

// locationId -> source file under src/assets/images, mirroring the old beachCoordinates.tsx
// static imports. Target blob name is always `${locationId}.png` inside the location-images
// container, matching each location's `imageBlobName` in locations.json.
const LOCATION_IMAGES = [
  { locationId: "sande", file: "02-Sandeviga-800.png" },
  { locationId: "sola", file: "04-Sola-800.png" },
  { locationId: "hellesto", file: "05-Hellesto-800.png" },
  { locationId: "sele", file: "06-Sele-North-Bore-800.png" },
  { locationId: "bore", file: "07-South-Bore-800.png" },
  { locationId: "orre", file: "10-Orre-800.png" },
  { locationId: "x", file: "11-X-800.png" },
  { locationId: "refsnes", file: "12-Refsnes-800.png" },
  { locationId: "brusand", file: "13-Brusand-800.png" },
];

const CONTENT_TYPE_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function main() {
  const force = process.argv.includes("--force");
  const connectionString = process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING;
  if (!connectionString) {
    console.error("AZURE_KITESPOTSAD77_CONNECTION_STRING is not set (check .env). Aborting.");
    process.exitCode = 1;
    return;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const createResult = await containerClient.createIfNotExists({ access: "blob" });
  if (createResult.succeeded) {
    console.log(`Created container "${CONTAINER_NAME}" with public read access for blobs (anonymous read, no listing, write stays private).`);
  } else {
    console.log(`Container "${CONTAINER_NAME}" already exists.`);
    try {
      await containerClient.setAccessPolicy("blob");
      console.log(`Confirmed container "${CONTAINER_NAME}" public access level is "blob".`);
    } catch (error) {
      console.warn(`Could not confirm/set public access level on "${CONTAINER_NAME}": ${error.message}`);
      console.warn("If this is a permissions/account-policy error, see the report for the server-side proxy fallback.");
    }
  }

  for (const { locationId, file } of LOCATION_IMAGES) {
    const ext = path.extname(file).toLowerCase();
    const blobName = `${locationId}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    if (!force && (await blockBlobClient.exists())) {
      console.log(`SKIP  ${blobName} (already exists; pass --force to re-upload)`);
      continue;
    }

    const localPath = path.join(IMAGES_DIR, file);
    const data = await readFile(localPath);
    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream" },
    });
    console.log(`UPLOAD ${file} -> ${CONTAINER_NAME}/${blobName} (${data.length} bytes)`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
