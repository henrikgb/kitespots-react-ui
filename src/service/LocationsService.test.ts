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

vi.mock("@/repository/LocationsRepository", () => ({
  downloadLocationsDocument,
  uploadLocationsDocument,
  fetchLocations: vi.fn(),
}));
vi.mock("@/repository/LocationImagesRepository", () => ({
  uploadLocationImage,
  deleteLocationImage,
}));
vi.mock("@/repository/WeatherDataRepository", () => ({
  deleteWeatherData,
}));

import { attachLocationImage, createLocation, deleteLocation, LocationServiceError } from "@/service/LocationsService";

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

describe("LocationsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AZURE_BLOB_PUBLIC_BASE_URL = "https://teststorage.blob.core.windows.net";
  });

  describe("createLocation", () => {
    it("generates an id, writes the document, and returns the new location", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

      const result = await createLocation({
        name: "New Spot",
        latitude: 58.5,
        longitude: 5.6,
        windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
      });

      expect(result.id).toBe("newspot");
      expect(result.imageUrl).toBeUndefined();
      expect(uploadLocationsDocument).toHaveBeenCalledTimes(1);
      const written = uploadLocationsDocument.mock.calls[0][0] as LocationsDocument;
      expect(written.locations).toHaveLength(2);
      expect(written.locations[1].id).toBe("newspot");
    });

    it("rejects invalid input with a 400 before touching Blob Storage", async () => {
      await expect(
        createLocation({ name: "", latitude: 200, longitude: 5.6, windDirectionDescriptions: [] })
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(downloadLocationsDocument).not.toHaveBeenCalled();
    });

    it("rejects a duplicate name with a 409", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

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
      downloadLocationsDocument.mockResolvedValue(document);

      const result = await createLocation({
        name: "New Spot",
        latitude: 58.5,
        longitude: 5.6,
        windDirectionDescriptions: [{ intervalStart: 0, intervalStop: 180, category: "offshore" }],
      });

      expect(result.id).toBe("newspot-2");
    });
  });

  describe("deleteLocation", () => {
    it("removes the location, writes the document, and deletes its image + weather blob", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

      await deleteLocation("sande");

      const written = uploadLocationsDocument.mock.calls[0][0] as LocationsDocument;
      expect(written.locations).toHaveLength(0);
      expect(deleteLocationImage).toHaveBeenCalledWith("location-images/sande.png");
      expect(deleteWeatherData).toHaveBeenCalledWith("sande");
    });

    it("still deletes the weather blob when the location never had an image", async () => {
      const document = baseDocument();
      delete document.locations[0].imageBlobName;
      downloadLocationsDocument.mockResolvedValue(document);

      await deleteLocation("sande");

      expect(deleteLocationImage).not.toHaveBeenCalled();
      expect(deleteWeatherData).toHaveBeenCalledWith("sande");
    });

    it("throws a 404 for an unknown id and does not write anything", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

      await expect(deleteLocation("does-not-exist")).rejects.toMatchObject({ statusCode: 404 });
      expect(uploadLocationsDocument).not.toHaveBeenCalled();
    });
  });

  describe("attachLocationImage", () => {
    it("uploads the image to a server-derived blob name and patches the location", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());
      const data = Buffer.from("fake-image-bytes");

      const result = await attachLocationImage("sande", data, "image/webp");

      expect(uploadLocationImage).toHaveBeenCalledWith("location-images/sande.webp", data, "image/webp");
      expect(result.imageUrl).toBe("https://teststorage.blob.core.windows.net/location-images/sande.webp");
    });

    it("rejects a disallowed MIME type with a 400 before uploading", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

      await expect(attachLocationImage("sande", Buffer.from("x"), "application/pdf")).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(uploadLocationImage).not.toHaveBeenCalled();
    });

    it("throws a 404 for an unknown location id", async () => {
      downloadLocationsDocument.mockResolvedValue(baseDocument());

      await expect(attachLocationImage("does-not-exist", Buffer.from("x"), "image/png")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  it("LocationServiceError carries a statusCode and error list", () => {
    const error = new LocationServiceError("bad", 400, ["a", "b"]);
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(["a", "b"]);
  });
});
