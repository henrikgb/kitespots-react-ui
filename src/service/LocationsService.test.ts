import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationsDocument } from "@/types/model/Location";

const {
  downloadLocationsDocument,
  uploadLocationsDocument,
  uploadLocationImage,
  deleteLocationImage,
  deleteWeatherData,
} = vi.hoisted(() => ({
  downloadLocationsDocument: vi.fn(),
  uploadLocationsDocument: vi.fn(),
  uploadLocationImage: vi.fn(),
  deleteLocationImage: vi.fn(),
  deleteWeatherData: vi.fn(),
}));

vi.mock("@/repository/LocationsRepository", async () => {
  const actual = await vi.importActual<typeof import("@/repository/LocationsRepository")>(
    "@/repository/LocationsRepository"
  );
  return {
    LocationsWriteConflictError: actual.LocationsWriteConflictError,
    LocationsDocumentCorruptError: actual.LocationsDocumentCorruptError,
    downloadLocationsDocument,
    uploadLocationsDocument,
    fetchLocations: vi.fn(),
  };
});
vi.mock("@/repository/LocationImagesRepository", () => ({
  uploadLocationImage,
  deleteLocationImage,
}));
vi.mock("@/repository/WeatherDataRepository", () => ({
  deleteWeatherData,
}));

import { attachLocationImage, createLocation, deleteLocation, LocationServiceError } from "@/service/LocationsService";
import { LocationsDocumentCorruptError, LocationsDocumentSnapshot, LocationsWriteConflictError } from "@/repository/LocationsRepository";

const baseDocument = (): LocationsDocument => ({
  schemaVersion: 1,
  locations: [
    {
      id: "sande",
      name: "Sande",
      latitude: 59.02,
      longitude: 5.59,
      imageBlobName: "location-images/sande.png",
      windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore", colorCode: "#FD0100" }],
    },
  ],
});

const baseSnapshot = (): LocationsDocumentSnapshot => ({ document: baseDocument(), etag: '"etag-1"' });

describe("LocationsService", () => {
  beforeEach(() => {
    // resetAllMocks (not clearAllMocks) so a mockRejectedValue set by one test - e.g. the ETag
    // conflict / write-failure cases below - can't leak into the next test's default behavior.
    vi.resetAllMocks();
    process.env.AZURE_BLOB_PUBLIC_BASE_URL = "https://teststorage.blob.core.windows.net";
    deleteLocationImage.mockResolvedValue(undefined);
    deleteWeatherData.mockResolvedValue(undefined);
  });

  describe("createLocation", () => {
    it("generates an id, writes the document conditioned on the read ETag, and returns the new location", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      const result = await createLocation({
        name: "New Spot",
        latitude: 58.5,
        longitude: 5.6,
        windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
      });

      expect(result.id).toBe("newspot");
      expect(result.imageUrl).toBeUndefined();
      expect(uploadLocationsDocument).toHaveBeenCalledTimes(1);
      const [written, etag] = uploadLocationsDocument.mock.calls[0] as [LocationsDocument, string | null];
      expect(written.locations).toHaveLength(2);
      expect(written.locations[1].id).toBe("newspot");
      expect(etag).toBe('"etag-1"');
    });

    it("rejects invalid input with a 400 before touching Blob Storage", async () => {
      await expect(
        createLocation({ name: "", latitude: 200, longitude: 5.6, windDirectionDescriptions: [] })
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(downloadLocationsDocument).not.toHaveBeenCalled();
    });

    it("rejects a duplicate name with a 409 (duplicate add)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      await expect(
        createLocation({
          name: "sande",
          latitude: 58.5,
          longitude: 5.6,
          windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(uploadLocationsDocument).not.toHaveBeenCalled();
    });

    it("suffixes the id on a slug collision that isn't a name collision", async () => {
      const document = baseDocument();
      document.locations.push({
        id: "newspot",
        name: "New Spot (old)",
        latitude: 1,
        longitude: 1,
        windDirectionDescriptions: [],
      });
      downloadLocationsDocument.mockResolvedValue({ document, etag: '"etag-1"' });

      const result = await createLocation({
        name: "New Spot",
        latitude: 58.5,
        longitude: 5.6,
        windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
      });

      expect(result.id).toBe("newspot-2");
    });

    it("surfaces a 409 conflict instead of losing the update when the ETag no longer matches (ETag conflict)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      uploadLocationsDocument.mockRejectedValue(new LocationsWriteConflictError());

      await expect(
        createLocation({
          name: "New Spot",
          latitude: 58.5,
          longitude: 5.6,
          windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("refuses to write over a corrupt locations.json rather than replacing it with a fresh document (malformed locations document)", async () => {
      downloadLocationsDocument.mockRejectedValue(new LocationsDocumentCorruptError("bad json"));

      await expect(
        createLocation({
          name: "New Spot",
          latitude: 58.5,
          longitude: 5.6,
          windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
        })
      ).rejects.toMatchObject({ statusCode: 500 });

      expect(uploadLocationsDocument).not.toHaveBeenCalled();
    });

    it("propagates an unexpected write failure instead of swallowing it (write failure)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      uploadLocationsDocument.mockRejectedValue(new Error("network blip"));

      await expect(
        createLocation({
          name: "New Spot",
          latitude: 58.5,
          longitude: 5.6,
          windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
        })
      ).rejects.toThrow("network blip");
    });
  });

  describe("deleteLocation", () => {
    it("removes the location, writes the document conditioned on the read ETag, and deletes its image + weather blob", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      await deleteLocation("sande");

      const [written, etag] = uploadLocationsDocument.mock.calls[0] as [LocationsDocument, string | null];
      expect(written.locations).toHaveLength(0);
      expect(etag).toBe('"etag-1"');
      expect(deleteLocationImage).toHaveBeenCalledWith("location-images/sande.png");
      expect(deleteWeatherData).toHaveBeenCalledWith("sande");
    });

    it("still deletes the weather blob when the location never had an image", async () => {
      const document = baseDocument();
      delete document.locations[0].imageBlobName;
      downloadLocationsDocument.mockResolvedValue({ document, etag: '"etag-1"' });

      await deleteLocation("sande");

      expect(deleteLocationImage).not.toHaveBeenCalled();
      expect(deleteWeatherData).toHaveBeenCalledWith("sande");
    });

    it("throws a 404 for an unknown id and does not write anything (deletion of missing location)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      await expect(deleteLocation("does-not-exist")).rejects.toMatchObject({ statusCode: 404 });
      expect(uploadLocationsDocument).not.toHaveBeenCalled();
    });

    it("surfaces a 409 conflict when another edit landed first (ETag conflict)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      uploadLocationsDocument.mockRejectedValue(new LocationsWriteConflictError());

      await expect(deleteLocation("sande")).rejects.toMatchObject({ statusCode: 409 });
      expect(deleteLocationImage).not.toHaveBeenCalled();
      expect(deleteWeatherData).not.toHaveBeenCalled();
    });
  });

  describe("attachLocationImage", () => {
    it("uploads the image to a server-derived blob name and patches the location", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      const data = Buffer.from("fake-image-bytes");

      const result = await attachLocationImage("sande", data, "image/webp");

      expect(uploadLocationImage).toHaveBeenCalledWith("location-images/sande.webp", data, "image/webp");
      expect(result.imageUrl).toBe("https://teststorage.blob.core.windows.net/location-images/sande.webp");
      expect(uploadLocationsDocument).toHaveBeenCalledWith(expect.anything(), '"etag-1"');
    });

    it("rejects a disallowed MIME type with a 400 before uploading", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      await expect(attachLocationImage("sande", Buffer.from("x"), "application/pdf")).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(uploadLocationImage).not.toHaveBeenCalled();
    });

    it("throws a 404 for an unknown location id", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());

      await expect(attachLocationImage("does-not-exist", Buffer.from("x"), "image/png")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("cleans up the just-uploaded image when the locations.json write fails (image cleanup after failed creation)", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      uploadLocationsDocument.mockRejectedValue(new Error("network blip"));
      deleteLocationImage.mockResolvedValue(undefined);

      await expect(attachLocationImage("sande", Buffer.from("x"), "image/png")).rejects.toThrow("network blip");

      expect(uploadLocationImage).toHaveBeenCalledWith("location-images/sande.png", expect.any(Buffer), "image/png");
      expect(deleteLocationImage).toHaveBeenCalledWith("location-images/sande.png");
    });

    it("still surfaces the original write failure even if the cleanup delete itself fails", async () => {
      downloadLocationsDocument.mockResolvedValue(baseSnapshot());
      uploadLocationsDocument.mockRejectedValue(new Error("network blip"));
      deleteLocationImage.mockRejectedValue(new Error("cleanup also failed"));

      await expect(attachLocationImage("sande", Buffer.from("x"), "image/png")).rejects.toThrow("network blip");
    });
  });

  it("LocationServiceError carries a statusCode and error list", () => {
    const error = new LocationServiceError("bad", 400, ["a", "b"]);
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(["a", "b"]);
  });
});
