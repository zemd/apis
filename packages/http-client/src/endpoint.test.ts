import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEndpoint } from "./endpoint";
import { fetchMock, addEndpointMock, clearEndpointMocks } from "./fetchMock";
import type { TFetchTransformer } from "./type";
import { json, method, prefix } from "./transformers";

describe("createEndpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearEndpointMocks();
  });

  describe("with json parsing", () => {
    it("should create endpoint that returns parsed JSON response", async () => {
      const mockData = { message: "success", data: [1, 2, 3] };
      addEndpointMock("/api/test", "GET", () => mockData);

      const endpoint = createEndpoint([json(), prefix("https://example.com")], { parseResponse: "json" }, fetchMock);
      const result = await endpoint<typeof mockData>("/api/test", []);

      expect(result).toEqual(mockData);
    });

    it("should apply transformers before making request", async () => {
      const mockData = { success: true };
      addEndpointMock("/api/transformed", "POST", () => mockData);

      const methodTransformer: TFetchTransformer = (fetchFn, url, options) => {
        return fetchFn(url, { ...options, method: "POST" });
      };

      const headerTransformer: TFetchTransformer = (fetchFn, url, options) => {
        return fetchFn(url, { ...options, headers: { ...options?.headers, "Content-Type": "application/json" } });
      };

      const endpoint = createEndpoint(
        [methodTransformer, json(), prefix("https://example.com")],
        { parseResponse: "json" },
        fetchMock,
      );
      const result = await endpoint<typeof mockData>("/api/transformed", [headerTransformer]);

      expect(result).toEqual(mockData);
    });

    it("should throw error for non-ok responses", async () => {
      addEndpointMock("/api/error", "GET", () => new Response("Not Found", { status: 404 }));

      const endpoint = createEndpoint([json(), prefix("https://example.com")], { parseResponse: "json" }, fetchMock);

      await expect(endpoint("/api/error", [])).rejects.toThrow("HTTP error occur. status: 404");
    });
  });

  describe("with text parsing", () => {
    it("should create endpoint that returns text response", async () => {
      const textData = "Hello, World!";
      addEndpointMock(
        "/api/text",
        "GET",
        () =>
          new Response(textData, {
            headers: { "Content-Type": "text/plain" },
          }),
      );

      const endpoint = createEndpoint([prefix("https://example.com")], { parseResponse: "text" }, fetchMock);
      const result = await endpoint<string>("/api/text", []);

      expect(result).toBe(textData);
    });
  });

  describe("with no parsing", () => {
    it("should return raw Response object", async () => {
      const responseData = new Response(JSON.stringify({ test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      addEndpointMock("/api/raw", "GET", () => responseData);

      const endpoint = createEndpoint([prefix("https://example.com")], { parseResponse: false }, fetchMock);
      const result = await endpoint<Response>("/api/raw", []);

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);
    });
  });

  describe("error handling", () => {
    it("should include response in error cause for non-ok responses", async () => {
      const errorResponse = new Response("Server Error", { status: 500 });
      addEndpointMock("/api/server-error", "GET", () => errorResponse);

      const endpoint = createEndpoint([json(), prefix("https://example.com")], { parseResponse: "json" }, fetchMock);

      try {
        await endpoint("/api/server-error", []);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (
          error instanceof Error &&
          typeof error.cause === "object" &&
          error.cause !== null &&
          "response" in error.cause
        ) {
          expect(error.cause?.response).toBe(errorResponse);
        }
      }
    });

    it("should handle JSON parsing errors gracefully", async () => {
      addEndpointMock(
        "/api/invalid-json",
        "GET",
        () =>
          new Response("invalid json{", {
            headers: { "Content-Type": "application/json" },
          }),
      );

      const endpoint = createEndpoint([json(), prefix("https://example.com")], { parseResponse: "json" }, fetchMock);

      await expect(endpoint("/api/invalid-json", [])).rejects.toThrow();
    });
  });

  describe("transformer combination", () => {
    it("should combine base transformers with endpoint transformers", async () => {
      const mockData = { combined: true };
      addEndpointMock("/api/combined", "PUT", () => mockData);

      const baseTransformer: TFetchTransformer = (fetchFn, url, options) => {
        return fetchFn(url, { ...options, method: "PUT" });
      };
      const endpointTransformer: TFetchTransformer = (fetchFn, url, options) => {
        return fetchFn(url, { ...options, headers: { Authorization: "Bearer token" } });
      };

      const endpoint = createEndpoint(
        [baseTransformer, json(), prefix("https://example.com")],
        { parseResponse: "json" },
        fetchMock,
      );
      const result = await endpoint<typeof mockData>("/api/combined", [endpointTransformer]);

      expect(result).toEqual(mockData);
    });
  });

  describe("default options", () => {
    it("should use json parsing by default", async () => {
      const mockData = { default: true };
      addEndpointMock("/api/default", "GET", () => mockData);

      const endpoint = createEndpoint([json(), prefix("https://example.com")], undefined, fetchMock);
      const result = await endpoint<typeof mockData>("/api/default", []);

      expect(result).toEqual(mockData);
    });

    it("should use global fetch by default when no fetchFn provided", async () => {
      const globalFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ global: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      global.fetch = globalFetch;

      const endpoint = createEndpoint([]);
      const result = await endpoint<{ global: boolean }>("https://api.example.com/test", []);

      expect(globalFetch).toHaveBeenCalledWith("https://api.example.com/test");
      expect(result).toEqual({ global: true });
    });
  });

  describe("with no parsing", () => {
    it("should return raw Response object", async () => {
      const responseData = new Response(JSON.stringify({ test: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      addEndpointMock("/raw", "GET", () => responseData);

      const endpoint = createEndpoint([prefix("https://example.com")], { parseResponse: false }, fetchMock);
      const result = await endpoint<Response>("/raw", []);

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(200);
    });

    it("should return Response object for 204 No Content regardless of parseResponse option", async () => {
      const noContentResponse = new Response(null, { status: 204 });
      addEndpointMock("/no-content", "DELETE", () => noContentResponse);

      const jsonEndpoint = createEndpoint(
        [prefix("https://example.com"), method("DELETE")],
        { parseResponse: "json" },
        fetchMock,
      );
      const textEndpoint = createEndpoint(
        [prefix("https://example.com"), method("DELETE")],
        { parseResponse: "text" },
        fetchMock,
      );
      const rawEndpoint = createEndpoint(
        [prefix("https://example.com"), method("DELETE")],
        { parseResponse: false },
        fetchMock,
      );

      const jsonResult = await jsonEndpoint<Response>("/no-content", []);
      const textResult = await textEndpoint<Response>("/no-content", []);
      const rawResult = await rawEndpoint<Response>("/no-content", []);

      expect(jsonResult).toBeInstanceOf(Response);
      expect(jsonResult.status).toBe(204);
      expect(textResult).toBeInstanceOf(Response);
      expect(textResult.status).toBe(204);
      expect(rawResult).toBeInstanceOf(Response);
      expect(rawResult.status).toBe(204);
    });
  });
});
