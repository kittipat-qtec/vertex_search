import { describe, it, expect } from "vitest";
import { parseAuthHeaders } from "@/lib/auth";

describe("parseAuthHeaders", () => {
  const makeHeaders = (entries: Record<string, string>) => new Headers(entries);

  it("should return null when no identity or email headers exist", () => {
    const result = parseAuthHeaders(makeHeaders({}));
    expect(result).toBeNull();
  });

  it("should parse DOMAIN\\\\username format", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-user": "QTEC\\admin.user",
        "x-iis-auth-displayname": "Admin User",
        "x-iis-auth-email": "admin@qtec.co.th",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.username).toBe("admin.user");
    expect(result!.domain).toBe("QTEC");
    expect(result!.displayName).toBe("Admin User");
    expect(result!.email).toBe("admin@qtec.co.th");
  });

  it("should handle email-only auth (no fullIdentity)", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-email": "test@qtec.co.th",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.username).toBe("test");
    expect(result!.email).toBe("test@qtec.co.th");
  });

  it("should fallback displayName to username", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-user": "QTEC\\john",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.displayName).toBe("john");
  });

  it("should use domain header when provided", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-user": "simple.user",
        "x-iis-auth-domain": "CORP",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.domain).toBe("CORP");
  });

  it("should handle DOMAIN/username format", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-user": "QTEC/slash.user",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.username).toBe("slash.user");
    expect(result!.domain).toBe("QTEC");
  });

  it("should generate fallback email if missing", () => {
    const result = parseAuthHeaders(
      makeHeaders({
        "x-iis-auth-user": "QTEC\\noemail",
      }),
    );

    expect(result).not.toBeNull();
    expect(result!.email).toBe("noemail@qtec.co.th");
  });
});
