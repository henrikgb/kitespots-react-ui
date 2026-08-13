import { beforeAll, describe, expect, it } from "vitest";
import {
  buildUploadConditions,
  isBlobNotFoundError,
  isConditionNotMetError,
  LocationsDocumentCorruptError,
  parseLocationsBlob,
  parseLocationsDocument,
  parseLocationsDocumentOrThrowCorrupt,
} from "@/repository/LocationsRepository";

/** Mirrors the shape @azure/storage-blob's RestError has for a Storage service error response. */
const storageError = (statusCode: number, code: string) => Object.assign(new Error(code), { statusCode, code });

const validWindDirectionDescriptions = [
  { intervalStart: 0, intervalStop: 180, category: "offshore", colorCode: "#FD0100" },
  { intervalStart: 180, intervalStop: 360, category: "onshore", colorCode: "#008000" },
];

beforeAll(() => {
  process.env.AZURE_BLOB_PUBLIC_BASE_URL = "https://teststorage.blob.core.windows.net";
});

describe("parseLocationsBlob", () => {
  it("parses a document with an arbitrary number of locations (not assuming nine)", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        {
          id: "sande",
          name: "Sande",
          latitude: 59.02,
          longitude: 5.59,
          imageBlobName: "location-images/sande.png",
          beginnerScore: 3,
          freestyleScore: 5,
          waveScore: 5,
          windDirectionDescriptions: validWindDirectionDescriptions,
        },
        {
          id: "newspot",
          name: "New Spot",
          latitude: 58.5,
          longitude: 5.6,
          imageBlobName: "location-images/newspot.png",
          beginnerScore: 2,
          freestyleScore: 2,
          waveScore: 2,
          windDirectionDescriptions: validWindDirectionDescriptions,
        },
      ],
    });

    const result = parseLocationsBlob(json);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("sande");
    expect(result[1].id).toBe("newspot");
  });

  it("builds a public Blob Storage image URL from imageBlobName (image URL generation)", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        {
          id: "sande",
          name: "Sande",
          latitude: 59.02,
          longitude: 5.59,
          imageBlobName: "location-images/sande.png",
        },
      ],
    });

    const result = parseLocationsBlob(json);

    expect(result[0].imageUrl).toBe("https://teststorage.blob.core.windows.net/location-images/sande.png");
  });

  it("leaves imageUrl undefined instead of crashing when a location has no imageBlobName yet (missing image behavior)", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "brand-new-spot", name: "Brand New Spot", latitude: 58.5, longitude: 5.6 },
      ],
    });

    const result = parseLocationsBlob(json);

    expect(result).toHaveLength(1);
    expect(result[0].imageUrl).toBeUndefined();
  });

  it("returns an empty array for a document with zero locations", () => {
    const json = JSON.stringify({ schemaVersion: 1, locations: [] });

    expect(parseLocationsBlob(json)).toEqual([]);
  });

  it("throws for a document that is not the expected LocationsDocument shape", () => {
    const malformed = JSON.stringify({ notLocations: [] });

    expect(() => parseLocationsBlob(malformed)).toThrow();
  });

  it("throws for invalid JSON", () => {
    expect(() => parseLocationsBlob("{not json")).toThrow();
  });

  it("skips individual locations missing required fields instead of failing the whole document", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "valid", name: "Valid", latitude: 58.5, longitude: 5.6, imageBlobName: "location-images/valid.png" },
        { id: "missing-name", latitude: 58.5, longitude: 5.6, imageBlobName: "location-images/x.png" },
        { id: "bad-lat", name: "Bad Lat", latitude: 200, longitude: 5.6, imageBlobName: "location-images/x.png" },
      ],
    });

    const result = parseLocationsBlob(json);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("valid");
  });

  it("skips a location whose imageBlobName is present but not a string (image reference parsing)", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "bad-image", name: "Bad Image", latitude: 58.5, longitude: 5.6, imageBlobName: 12345 },
      ],
    });

    expect(parseLocationsBlob(json)).toEqual([]);
  });

  it("defaults missing optional scores to 0 and missing windDirectionDescriptions to an empty array", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "minimal", name: "Minimal", latitude: 58.5, longitude: 5.6, imageBlobName: "location-images/minimal.png" },
      ],
    });

    const result = parseLocationsBlob(json);

    expect(result[0].beginnerScore).toBe(0);
    expect(result[0].freestyleScore).toBe(0);
    expect(result[0].waveScore).toBe(0);
    expect(result[0].windDirectionDescriptions).toEqual([]);
  });

  it("throws when the document contains duplicate location ids", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "sele", name: "Sele", latitude: 58.5, longitude: 5.6, imageBlobName: "location-images/sele.png" },
        { id: "SELE", name: "Sele Again", latitude: 58.5, longitude: 5.6, imageBlobName: "location-images/sele2.png" },
      ],
    });

    expect(() => parseLocationsBlob(json)).toThrow(/duplicate/i);
  });
});

describe("parseLocationsDocument", () => {
  it("parses a well-formed document, preserving fields the public parser would normalize", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [
        { id: "sande", name: "Sande", latitude: 59.02, longitude: 5.59, windDirectionDescriptions: [] },
      ],
    });

    const document = parseLocationsDocument(json);

    expect(document.schemaVersion).toBe(1);
    expect(document.locations).toHaveLength(1);
    expect(document.locations[0].id).toBe("sande");
  });

  it("does not silently drop an entry that the tolerant public parser would filter out", () => {
    // Missing latitude/longitude - parseLocationsBlob would drop this entirely, which would
    // be a data-loss bug if it happened during an admin read-modify-write round trip.
    const json = JSON.stringify({
      schemaVersion: 1,
      locations: [{ id: "incomplete", name: "Incomplete", windDirectionDescriptions: [] }],
    });

    const document = parseLocationsDocument(json);

    expect(document.locations).toHaveLength(1);
    expect(document.locations[0].id).toBe("incomplete");
  });

  it("throws for a document missing the locations array", () => {
    expect(() => parseLocationsDocument(JSON.stringify({ schemaVersion: 1 }))).toThrow();
  });

  it("throws when any entry is missing a string id", () => {
    const json = JSON.stringify({ schemaVersion: 1, locations: [{ name: "No Id" }] });

    expect(() => parseLocationsDocument(json)).toThrow(/missing a string id/);
  });
});

// These next three describe blocks cover the Phase 7 optimistic-concurrency logic used by
// downloadLocationsDocument/uploadLocationsDocument. Those two functions themselves are thin
// wrappers around the Azure SDK (like fetchLocations above, which also isn't unit tested here)
// and are exercised indirectly via LocationsService.test.ts, which mocks this module wholesale.
// What's tested directly here is the actual decision logic - error classification, condition
// building, and corrupt-vs-missing classification - kept as pure functions for exactly this
// reason.

describe("isBlobNotFoundError", () => {
  it("is true for a 404 statusCode", () => {
    expect(isBlobNotFoundError(storageError(404, "BlobNotFound"))).toBe(true);
  });

  it("is true for the BlobNotFound error code even without a statusCode", () => {
    expect(isBlobNotFoundError({ code: "BlobNotFound" })).toBe(true);
  });

  it("is false for an unrelated error", () => {
    expect(isBlobNotFoundError(storageError(500, "InternalError"))).toBe(false);
    expect(isBlobNotFoundError(new Error("boom"))).toBe(false);
    expect(isBlobNotFoundError(null)).toBe(false);
  });
});

describe("isConditionNotMetError", () => {
  it("is true for a 412 Precondition Failed (If-Match failed - ETag conflict)", () => {
    expect(isConditionNotMetError(storageError(412, "ConditionNotMet"))).toBe(true);
  });

  it("is true for a 409 Conflict (If-None-Match: * failed - blob already exists)", () => {
    expect(isConditionNotMetError(storageError(409, "BlobAlreadyExists"))).toBe(true);
  });

  it("is false for an unrelated failure, so it is not mistaken for a conflict (write failure)", () => {
    expect(isConditionNotMetError(storageError(503, "ServerBusy"))).toBe(false);
    expect(isConditionNotMetError(storageError(404, "BlobNotFound"))).toBe(false);
  });
});

describe("buildUploadConditions", () => {
  it("conditions on If-Match when an ETag is given (normal update)", () => {
    expect(buildUploadConditions('"abc123"')).toEqual({ ifMatch: '"abc123"' });
  });

  it("conditions on If-None-Match: * when etag is null (bootstrapping a brand-new document)", () => {
    expect(buildUploadConditions(null)).toEqual({ ifNoneMatch: "*" });
  });
});

describe("parseLocationsDocumentOrThrowCorrupt", () => {
  it("returns the parsed document for valid JSON", () => {
    const json = JSON.stringify({ schemaVersion: 1, locations: [{ id: "sande", name: "Sande" }] });

    expect(parseLocationsDocumentOrThrowCorrupt(json).locations).toHaveLength(1);
  });

  it("throws LocationsDocumentCorruptError instead of treating invalid JSON as empty (malformed locations document)", () => {
    expect(() => parseLocationsDocumentOrThrowCorrupt("{not valid json")).toThrow(LocationsDocumentCorruptError);
  });

  it("throws LocationsDocumentCorruptError for well-formed JSON that doesn't match the document contract", () => {
    const json = JSON.stringify({ notLocations: [] });

    expect(() => parseLocationsDocumentOrThrowCorrupt(json)).toThrow(LocationsDocumentCorruptError);
  });

  it("throws LocationsDocumentCorruptError (not the raw parse error) so callers can distinguish corruption from other failures", () => {
    try {
      parseLocationsDocumentOrThrowCorrupt("{not valid json");
      throw new Error("expected parseLocationsDocumentOrThrowCorrupt to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(LocationsDocumentCorruptError);
      expect((error as Error).message).toMatch(/refusing to treat it as empty/);
    }
  });
});
