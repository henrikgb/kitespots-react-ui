import { describe, expect, it, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const { getServerSession } = vi.hoisted(() => ({ getServerSession: vi.fn() }));
const { isAuthorizedAdminEmail } = vi.hoisted(() => ({ isAuthorizedAdminEmail: vi.fn() }));
vi.mock("next-auth/next", () => ({ getServerSession }));
vi.mock("@/pages/api/auth/[...nextauth]", () => ({ authOptions: {} }));
vi.mock("@/domain/adminAuthorization", () => ({ isAuthorizedAdminEmail }));

import { requireSession } from "@/util/auth/requireSession";

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as NextApiResponse & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
};

describe("requireSession", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    isAuthorizedAdminEmail.mockReset();
  });

  it("returns the session when one exists and its email is authorized", async () => {
    const session = { user: { name: "Admin", email: "henrik-gb@hotmail.com" } };
    getServerSession.mockResolvedValue(session);
    isAuthorizedAdminEmail.mockReturnValue(true);
    const res = createMockRes();

    const result = await requireSession({} as NextApiRequest, res);

    expect(result).toBe(session);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("writes a 401 and returns null when there is no session (anonymous write rejection)", async () => {
    getServerSession.mockResolvedValue(null);
    const res = createMockRes();

    const result = await requireSession({} as NextApiRequest, res);

    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(isAuthorizedAdminEmail).not.toHaveBeenCalled();
  });

  it("writes a 403 and returns null when authenticated but not on the admin allowlist", async () => {
    const session = { user: { name: "Stranger", email: "stranger@example.com" } };
    getServerSession.mockResolvedValue(session);
    isAuthorizedAdminEmail.mockReturnValue(false);
    const res = createMockRes();

    const result = await requireSession({} as NextApiRequest, res);

    expect(result).toBeNull();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });
});
