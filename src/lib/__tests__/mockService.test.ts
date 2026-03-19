import { describe, it, expect } from "vitest";
import { getMockAnswer } from "@/lib/mock/mockService";

describe("mockService", () => {
  it("should return an AskResponse object", async () => {
    const result = await getMockAnswer("วันหยุด", "test-req-1");

    expect(result).toHaveProperty("ok", true);
    expect(result).toHaveProperty("answer");
    expect(result).toHaveProperty("requestId", "test-req-1");
    expect(result).toHaveProperty("sources");
    expect(result).toHaveProperty("latencyMs");
    expect(typeof result.answer).toBe("string");
    expect(result.answer.length).toBeGreaterThan(0);
  });

  it("should return relevant sources for a matched topic", async () => {
    const result = await getMockAnswer("นโยบายการลา", "test-req-2");

    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0]).toHaveProperty("title");
  });

  it("should return a fallback response for unknown queries", async () => {
    const result = await getMockAnswer("xyzzy_unknown_topic", "test-req-3");

    expect(result.ok).toBe(true);
    expect(result.answer.length).toBeGreaterThan(0);
  });

  it("should have a simulated latency", async () => {
    const result = await getMockAnswer("สิทธิพนักงาน", "test-req-4");

    expect(result.latencyMs).toBeGreaterThan(0);
  });

  it("should include model info", async () => {
    const result = await getMockAnswer("test", "test-req-5");

    expect(result).toHaveProperty("model");
    expect(typeof result.model).toBe("string");
  });
});
