import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { MAX_IMAGE_SIZE_BYTES } from "@/domain/locationValidation";

const { attachLocationImage } = vi.hoisted(() => ({ attachLocationImage: vi.fn() }));
const { requireSession } = vi.hoisted(() => ({ requireSession: vi.fn() }));

vi.mock("@/service/LocationsService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/service/LocationsService")>();
  return { ...actual, attachLocationImage };
});
vi.mock("@/util/auth/requireSession", () => ({ requireSession }));

import handler from "@/pages/api/locations/[id]/image";

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res as NextApiResponse & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };
};

const createFakeImageRequest = (opts: {
  method?: string;
  id?: string;
  contentType?: string;
  body?: Buffer;
}): NextApiRequest => {
  const stream = Readable.from(opts.body ? [opts.body] : []) as unknown as NextApiRequest;
  stream.method = opts.method ?? "POST";
  stream.query = { id: opts.id ?? "sande" };
  stream.headers = { "content-type": opts.contentType } as NextApiRequest["headers"];
  return stream;
};

describe("POST /api/locations/[id]/image", () => {
  beforeEach(() => {
    attachLocationImage.mockReset();
    requireSession.mockReset();
  });

  it("rejects an anonymous request with 401 and never reads the body", async () => {
    requireSession.mockResolvedValue(null);
    const req = createFakeImageRequest({ body: Buffer.from("bytes"), contentType: "image/png" });
    const res = createMockRes();

    await handler(req, res);

    expect(attachLocationImage).not.toHaveBeenCalled();
  });

  it("uploads the image for an authenticated request and responds 200", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const updated = { id: "sande", imageUrl: "https://example/location-images/sande.png" };
    attachLocationImage.mockResolvedValue(updated);
    const body = Buffer.from("fake-image-bytes");
    const req = createFakeImageRequest({ id: "sande", contentType: "image/png", body });
    const res = createMockRes();

    await handler(req, res);

    expect(attachLocationImage).toHaveBeenCalledWith("sande", expect.any(Buffer), "image/png");
    expect(attachLocationImage.mock.calls[0][1].equals(body)).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: updated });
  });

  it("responds 413 when the body exceeds the size limit before ever calling the service", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const oversized = Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 2000, 1);
    const req = createFakeImageRequest({ id: "sande", contentType: "image/png", body: oversized });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(attachLocationImage).not.toHaveBeenCalled();
  });

  it("maps a LocationServiceError (e.g. disallowed MIME type) to its statusCode", async () => {
    requireSession.mockResolvedValue({ user: { name: "Admin" } });
    const { LocationServiceError } = await import("@/service/LocationsService");
    attachLocationImage.mockRejectedValue(new LocationServiceError("Invalid image upload.", 400, ["bad type"]));
    const req = createFakeImageRequest({ id: "sande", contentType: "application/pdf", body: Buffer.from("x") });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responds 405 for unsupported methods", async () => {
    const req = createFakeImageRequest({ method: "GET" });
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
