import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
  compose,
  method,
  header,
  json,
  prefix,
  query,
  body,
  debug,
  retry,
  cache,
  endpoint,
  createBuildEndpointFn,
} from "./index.js";

describe("HTTP Client", () => {
  let mockFetch: Mock<typeof fetch>;

  beforeEach(() => {
    mockFetch = vi.fn(() => Promise.resolve(new Response()));
    global.fetch = mockFetch;
  });

  describe("compose", () => {
    it("should compose transformers", async () => {
      const composed = compose([method("POST"), json()]);
      await composed("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    });
  });

  describe("method", () => {
    it("should set the HTTP method", async () => {
      const get = compose([method("PUT")]);
      await get("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        method: "PUT",
      });
    });
  });

  describe("header", () => {
    it("should set a custom header", async () => {
      const withAuth = compose([header("Authorization", "Bearer token")]);
      await withAuth("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        headers: { Authorization: "Bearer token" },
      });
    });
  });

  describe("json", () => {
    it("should set Content-Type to application/json", async () => {
      const jsonRequest = compose([json()]);
      await jsonRequest("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
        headers: { "Content-Type": "application/json" },
      });
    });
  });

  describe("prefix", () => {
    it("should add prefix to the URL", async () => {
      const withPrefix = compose([prefix("https://example.com/api")]);
      await withPrefix("/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/api/users",
        undefined,
      );
    });
  });

  describe("query", () => {
    it("should add query parameters to the URL", async () => {
      const withQuery = compose([query({ page: "1", limit: "10" })]);
      await withQuery("https://api.example.com/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users?page=1&limit=10",
        undefined,
      );
    });
  });

  describe("body", () => {
    it("should set the request body", async () => {
      const withBody = compose([body(JSON.stringify({ name: "John" }))]);
      await withBody("https://api.example.com/users");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/users", {
        body: JSON.stringify({ name: "John" }),
      });
    });
  });

  describe("debug", () => {
    it("should call the debug function", async () => {
      const debugFn = vi.fn();
      const withDebug = compose([debug(debugFn)]);
      await withDebug("https://api.example.com");

      expect(debugFn).toHaveBeenCalled();
    });
  });

  describe("retry", () => {
    it("should retry on failure", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(new Response());

      const withRetry = compose([retry(2, 100)]);
      await withRetry("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("cache", () => {
    it("should cache GET requests", async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ data: "test" })),
      );

      const withCache = compose([method("GET"), cache(1000)]);
      await withCache("https://api.example.com");
      await withCache("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("endpoint", () => {
    it("should create an endpoint function", async () => {
      const getUser = endpoint(() => ({
        url: "https://api.example.com/users/1",
        transformers: [method("GET")],
      }));

      await getUser();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        { method: "GET" },
      );
    });
  });

  describe("createBuildEndpointFn", () => {
    it("should create a build function with common transformers", async () => {
      const build = createBuildEndpointFn({
        baseUrl: "https://api.example.com",
      });
      const getUser = build((param: number) => ({
        url: `/users/${param}`,
        transformers: [method("GET")],
      }));

      await getUser(1);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
    });
  });
});
