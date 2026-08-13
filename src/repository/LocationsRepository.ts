import { KiteSpotLocation, LocationsDocument, WindDirectionDescription, getLocationImageUrl } from "@/types/model/Location";
const { BlobServiceClient } = require('@azure/storage-blob');

const LOCATIONS_AZURE_BLOB_CONTAINER = "weatherdata";
const LOCATIONS_BLOB_NAME = "locations.json";
const CURRENT_SCHEMA_VERSION = 1;

interface RawLocation {
  id: unknown;
  name: unknown;
  latitude: unknown;
  longitude: unknown;
  imageBlobName?: unknown;
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
    // A location may not have its image uploaded yet - see toKiteSpotLocation, which leaves
    // imageUrl undefined in that case rather than dropping the whole location.
    (l.imageBlobName === undefined || typeof l.imageBlobName === "string") &&
    (l.windDirectionDescriptions === undefined ||
      (Array.isArray(l.windDirectionDescriptions) && l.windDirectionDescriptions.every(isValidWindDirectionDescription)))
  );
};

const toKiteSpotLocation = (raw: RawLocation): KiteSpotLocation => ({
  id: raw.id as string,
  name: raw.name as string,
  latitude: raw.latitude as number,
  longitude: raw.longitude as number,
  imageUrl: typeof raw.imageBlobName === "string" ? getLocationImageUrl(raw.imageBlobName) : undefined,
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

/**
 * Parses locations.json into its raw, on-disk shape for admin read-modify-write operations
 * (add/delete a location). Deliberately stricter and less forgiving than parseLocationsBlob:
 * every entry must have at least a string id, and nothing is silently dropped - losing an
 * entry here would mean writing it out of existence the next time someone adds or deletes a
 * different location.
 */
export const parseLocationsDocument = (rawJson: string): LocationsDocument => {
  const parsed = JSON.parse(rawJson);

  if (!parsed || typeof parsed.schemaVersion !== "number" || !Array.isArray(parsed.locations)) {
    throw new Error("Locations blob does not match the expected LocationsDocument contract.");
  }

  parsed.locations.forEach((location: unknown, index: number) => {
    if (!location || typeof (location as { id?: unknown }).id !== "string" || !(location as { id: string }).id) {
      throw new Error(`Locations document entry at index ${index} is missing a string id.`);
    }
  });

  return parsed as LocationsDocument;
};

/**
 * Thrown when a conditional write to locations.json is rejected because the blob changed (or
 * was created) since it was last read - either the ETag no longer matches (someone else's edit
 * landed first) or the blob now exists when the write expected to create it from scratch (two
 * concurrent "first ever write" bootstraps). The caller lost the race; it must not overwrite
 * the newer content. See uploadLocationsDocument.
 */
export class LocationsWriteConflictError extends Error {
  constructor(message = "locations.json was modified by someone else before this change could be saved.") {
    super(message);
    this.name = "LocationsWriteConflictError";
  }
}

/**
 * Thrown when locations.json exists but its content is not valid JSON or does not match the
 * LocationsDocument contract. Deliberately distinct from "blob does not exist" (see
 * downloadLocationsDocument) - a corrupt document must never be treated as "nothing here yet"
 * and silently replaced with an empty/default document, which would destroy whatever real
 * configuration is actually in there.
 */
export class LocationsDocumentCorruptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocationsDocumentCorruptError";
  }
}

export interface LocationsDocumentSnapshot {
  document: LocationsDocument;
  /**
   * The blob's ETag at the moment it was read, to be passed back to uploadLocationsDocument for
   * an optimistic-concurrency conditional write (If-Match). `null` means the blob did not exist
   * at all (fresh environment, nothing has ever been written) - the next write must instead use
   * an "only if it still doesn't exist" (If-None-Match: *) condition, see uploadLocationsDocument.
   */
  etag: string | null;
}

/**
 * True for the RestError @azure/storage-blob throws when the blob doesn't exist (HTTP 404,
 * x-ms-error-code "BlobNotFound"). Kept as a pure predicate over the error's shape (not the
 * Azure SDK itself) so it can be unit tested without mocking Blob Storage - mirrors this file's
 * other pure helpers like parseLocationsDocument.
 */
export const isBlobNotFoundError = (error: unknown): boolean => {
  const err = error as { statusCode?: number; code?: string } | null;
  return err?.statusCode === 404 || err?.code === "BlobNotFound";
};

/**
 * True for the RestError @azure/storage-blob throws when a conditional write's If-Match or
 * If-None-Match precondition fails - i.e. someone else's write landed first (HTTP 412
 * "ConditionNotMet") or, for a fresh-blob bootstrap, the blob already exists (HTTP 409
 * "BlobAlreadyExists"). Pure predicate, see isBlobNotFoundError.
 */
export const isConditionNotMetError = (error: unknown): boolean => {
  const err = error as { statusCode?: number; code?: string } | null;
  return (
    err?.statusCode === 412 ||
    err?.statusCode === 409 ||
    err?.code === "ConditionNotMet" ||
    err?.code === "BlobAlreadyExists"
  );
};

/**
 * Builds the Blob Storage request condition for a locations.json write. `null` means the caller
 * believes the blob does not exist yet, so the write must only succeed if that is still true
 * (If-None-Match: *); otherwise the write is conditioned on the ETag read alongside the content
 * (If-Match). Pure function, see isBlobNotFoundError.
 */
export const buildUploadConditions = (
  expectedEtag: string | null
): { ifMatch: string } | { ifNoneMatch: string } => (expectedEtag ? { ifMatch: expectedEtag } : { ifNoneMatch: "*" });

/**
 * Parses locations.json content for an admin read-modify-write, translating a parse/validation
 * failure into LocationsDocumentCorruptError. Pure function (no Azure SDK calls) wrapping
 * parseLocationsDocument, so the "corrupt blob" classification can be unit tested in isolation.
 */
export const parseLocationsDocumentOrThrowCorrupt = (rawJson: string): LocationsDocument => {
  try {
    return parseLocationsDocument(rawJson);
  } catch (parseError) {
    throw new LocationsDocumentCorruptError(
      `locations.json exists but is not valid - refusing to treat it as empty and overwrite it: ${(parseError as Error).message}`
    );
  }
};

/** Node-side helper: @azure/storage-blob's BlobClient.download() hands back a raw stream. */
const streamToBuffer = async (readable: NodeJS.ReadableStream): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

/**
 * Downloads locations.json for an admin read-modify-write operation (add/delete/attach-image),
 * capturing its ETag in the same request as its content so the two can never drift apart. Pair
 * with uploadLocationsDocument, passing back the returned etag, to detect a concurrent edit
 * instead of silently overwriting it (Phase 7 optimistic concurrency).
 *
 * A missing blob (404) is treated as "initial setup, nothing written yet" - not corruption - and
 * returns an empty document with etag: null so the first write can safely create it. A blob that
 * exists but fails to parse/validate is corruption and throws LocationsDocumentCorruptError
 * rather than being papered over.
 */
export const downloadLocationsDocument = async (): Promise<LocationsDocumentSnapshot> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATIONS_AZURE_BLOB_CONTAINER);
  const blobClient = containerClient.getBlobClient(LOCATIONS_BLOB_NAME);

  let downloadResponse;
  try {
    downloadResponse = await blobClient.download();
  } catch (error) {
    if (isBlobNotFoundError(error)) {
      return { document: { schemaVersion: CURRENT_SCHEMA_VERSION, locations: [] }, etag: null };
    }
    throw error;
  }

  const content = await streamToBuffer(downloadResponse.readableStreamBody);
  const document = parseLocationsDocumentOrThrowCorrupt(content.toString('utf-8'));

  return { document, etag: downloadResponse.etag ?? null };
};

/**
 * Overwrites locations.json, conditioned on the ETag captured by downloadLocationsDocument so a
 * concurrent write is detected instead of silently lost (optimistic concurrency - see Phase 7).
 * `expectedEtag: null` means the caller believes the blob does not exist yet and the write must
 * only succeed if that is still true (If-None-Match: *); otherwise the write is conditioned on
 * If-Match: expectedEtag. Either condition failing throws LocationsWriteConflictError - the
 * caller must re-read and retry (or surface a conflict to the user); this function never retries
 * on its own, keeping this a single conditional PUT with no distributed locking involved.
 * schemaVersion defaults to the current version if not carried over. Returns the new ETag.
 */
export const uploadLocationsDocument = async (
  document: LocationsDocument,
  expectedEtag: string | null
): Promise<string> => {
  const body = JSON.stringify(
    { schemaVersion: document.schemaVersion || CURRENT_SCHEMA_VERSION, locations: document.locations },
    null,
    2
  );

  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_KITESPOTSAD77_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(LOCATIONS_AZURE_BLOB_CONTAINER);
  const blockBlobClient = containerClient.getBlockBlobClient(LOCATIONS_BLOB_NAME);

  const conditions = buildUploadConditions(expectedEtag);

  try {
    const result = await blockBlobClient.upload(body, Buffer.byteLength(body), {
      blobHTTPHeaders: { blobContentType: "application/json" },
      conditions,
    });
    return result.etag as string;
  } catch (error) {
    if (isConditionNotMetError(error)) {
      throw new LocationsWriteConflictError();
    }
    throw error;
  }
};
