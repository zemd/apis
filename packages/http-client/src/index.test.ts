import { describe, it, expect, vi, beforeEach, type Mock, afterEach } from "vitest";
import { compose, method, header, json, prefix, query, debug, retry, cache, createEndpoint } from "./";

describe("HTTP Client", () => {
  let mockFetch: Mock<typeof fetch>;

  beforeEach(() => {
    mockFetch = vi.fn(async (): Promise<Response> => {
      return new Response(JSON.stringify({ data: "test" }), {
        headers: { "Content-Type": "application/json" },
      });
    });
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("compose", () => {
    it("should handle empty transformer array", async () => {
      const composed = compose([]);
      await composed("https://api.example.com");
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com");
    });

    it("should compose multiple transformers", async () => {
      const composed = compose([method("POST"), json(), header("Authorization", "Bearer token")]);
      await composed("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token",
        },
      });
    });
  });

  describe("method", () => {
    it("should preserve existing request options when setting method", async () => {
      const get = compose([method("PUT"), header("X-Custom", "value")]);
      await get("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        method: "PUT",
        headers: expect.objectContaining({
          "x-custom": "value",
        }),
      });
    });
  });

  describe("header", () => {
    it("should handle multiple headers", async () => {
      const withHeaders = compose([header("Authorization", "Bearer token"), header("X-Custom", "value")]);
      await withHeaders("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        headers: expect.objectContaining({
          authorization: "Bearer token",
          "x-custom": "value",
        }),
      });
    });

    it("should handle empty header values", async () => {
      const withHeaders = compose([header("X-Empty", "")]);
      await withHeaders("https://api.example.com");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com",
        expect.objectContaining({
          headers: expect.objectContaining({ "x-empty": "" }),
        }),
      );
    });
  });

  describe("prefix", () => {
    it("should handle URLs with existing paths", async () => {
      const withPrefix = compose([prefix("https://example.com/api")]);
      await withPrefix("/users/123");

      expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/users/123", undefined);
    });
  });

  describe("query", () => {
    it("should preserve existing query parameters", async () => {
      const withQuery = compose([query({ sort: "desc" })]);
      await withQuery("https://api.example.com/users?page=1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://api.example.com/users?page=1&sort=desc"),
        undefined,
      );
    });
  });

  describe("retry", () => {
    it("should retry specified number of times", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(new Response());

      const withRetry = compose([retry(3, 10)]);
      await withRetry("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should throw after max retries", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const withRetry = compose([retry(2, 10)]);
      await expect(withRetry("https://api.example.com")).rejects.toThrow("Network error");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should retry with exponential backoff", async () => {
      const start = Date.now();
      mockFetch.mockRejectedValue(new Error("Network error"));

      const withRetry = compose([
        retry(2, 100, (i) => {
          return Math.pow(2, i);
        }),
      ]);
      await expect(withRetry("https://api.example.com")).rejects.toThrow();

      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(300); // Base delay + exponential
    });
  });

  describe("cache", () => {
    it("should only cache GET requests", async () => {
      const withCache = compose([method("POST"), cache(1000)]);
      await withCache("https://api.example.com");
      await withCache("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should respect cache max age", async () => {
      const withCache = compose([method("GET"), cache(100)]);

      await withCache("https://api.example.com");
      await new Promise((resolve) => {
        setTimeout(resolve, 150);
      });
      await withCache("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("debug", () => {
    it("should call custom debug function with request params", async () => {
      const debugFn = vi.fn();
      const withDebug = compose([debug(debugFn)]);
      await withDebug("https://api.example.com", { method: "POST" });

      expect(debugFn).toHaveBeenCalledWith(["https://api.example.com", { method: "POST" }]);
    });
  });

  describe("createEndpoint", () => {
    it("should combine common and specific transformers", async () => {
      const endpoint = createEndpoint([prefix("https://api.example.com"), header("X-Common", "common")]);

      await endpoint("/users", [method("GET"), header("X-Specific", "specific")]);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "x-common": "common",
            "x-specific": "specific",
          }),
        }),
      );
    });
  });

  describe("Integration", () => {
    it("should handle complex transformer combinations", async () => {
      const endpoint = createEndpoint([
        prefix("https://api.example.com"),
        retry(3, 100),
        cache(1000),
        debug(console.log),
      ]);

      const result = await endpoint("/users", [method("GET"), query({ page: "1" }), json()]);

      expect(result).toEqual({ data: "test" });
    });
  });
});
