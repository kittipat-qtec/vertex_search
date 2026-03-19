import { describe, it, expect, beforeEach } from "vitest";

// We can't directly import rate-limit.ts because it uses module-scoped state.
// Instead, we'll test the pure logic by dynamically importing fresh modules.

describe("rate-limit", () => {
  let checkRateLimit: (id: string) => {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number | null;
  };

  beforeEach(async () => {
    // Reset module state for each test by re-importing
    const mod = await import("@/lib/rate-limit");
    checkRateLimit = mod.checkRateLimit;
  });

  it("should allow the first request", () => {
    const result = checkRateLimit("test-user-allow");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.retryAfterMs).toBeNull();
  });

  it("should decrement remaining count", () => {
    const id = "test-user-decrement";
    checkRateLimit(id);
    checkRateLimit(id);
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
  });

  it("should block after 10 requests", () => {
    const id = "test-user-block";
    for (let i = 0; i < 10; i++) {
      checkRateLimit(id);
    }

    const result = checkRateLimit(id);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(0);
  });

  it("should track users independently", () => {
    const idA = "test-user-a";
    const idB = "test-user-b";

    for (let i = 0; i < 10; i++) {
      checkRateLimit(idA);
    }

    const resultA = checkRateLimit(idA);
    const resultB = checkRateLimit(idB);

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  describe("getRateLimitIdentifier", () => {
    it("should extract user from x-iis-auth-user header", async () => {
      const { getRateLimitIdentifier } = await import("@/lib/rate-limit");
      const request = new Request("http://localhost", {
        headers: { "x-iis-auth-user": "QTEC\\admin" },
      });
      expect(getRateLimitIdentifier(request)).toBe("QTEC\\admin");
    });

    it("should fall back to x-forwarded-for", async () => {
      const { getRateLimitIdentifier } = await import("@/lib/rate-limit");
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      });
      expect(getRateLimitIdentifier(request)).toBe("192.168.1.1");
    });

    it("should return 'anonymous' when no headers present", async () => {
      const { getRateLimitIdentifier } = await import("@/lib/rate-limit");
      const request = new Request("http://localhost");
      expect(getRateLimitIdentifier(request)).toBe("anonymous");
    });
  });
});
