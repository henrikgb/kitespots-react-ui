import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("isAuthorizedAdminEmail", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS;

  afterEach(() => {
    process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("authorizes any authenticated session when no allowlist is configured", async () => {
    process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS = "";
    vi.resetModules();
    const { isAuthorizedAdminEmail } = await import("@/domain/adminAuthorization");

    expect(isAuthorizedAdminEmail("anyone@example.com")).toBe(true);
    expect(isAuthorizedAdminEmail(undefined)).toBe(true);
  });

  it("only authorizes emails on the allowlist once one is configured", async () => {
    process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS = "henrik-gb@hotmail.com, other@example.com";
    vi.resetModules();
    const { isAuthorizedAdminEmail } = await import("@/domain/adminAuthorization");

    expect(isAuthorizedAdminEmail("henrik-gb@hotmail.com")).toBe(true);
    expect(isAuthorizedAdminEmail("stranger@example.com")).toBe(false);
    expect(isAuthorizedAdminEmail(undefined)).toBe(false);
  });

  it("is case-insensitive and trims whitespace", async () => {
    process.env.NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS = "Henrik-GB@Hotmail.com";
    vi.resetModules();
    const { isAuthorizedAdminEmail } = await import("@/domain/adminAuthorization");

    expect(isAuthorizedAdminEmail("  henrik-gb@hotmail.com  ")).toBe(true);
  });
});
