import { describe, it, expect } from "vitest";
import { fetchMock, addEndpointMock } from "./fetchMock";

describe("fetchMock", () => {
  it("returns mocked JSON response for registered endpoint", async () => {
    const endpoint = "/test/endpoint1";
    const url = `https://example.com${endpoint}`;

    addEndpointMock(endpoint, "GET", () => {
      return { success: true };
    });

    const response = await fetchMock(url, { method: "GET" });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    const data = await response.json();
    expect(data).toEqual({ success: true });
  });

  it("returns mocked Response object if implementation returns Response", async () => {
    const endpoint = "/test/endpoint2";
    const url = `https://example.com${endpoint}`;

    addEndpointMock(endpoint, "GET", () => {
      return new Response("custom", { status: 201 });
    });

    const response = await fetchMock(url, { method: "GET" });
    expect(response.status).toBe(201);
    const text = await response.text();
    expect(text).toBe("custom");
  });

  it("throws error if no mock is registered", async () => {
    const endpoint = "/test/endpoint3";
    const url = `https://example.com${endpoint}`;

    await expect(fetchMock(url, { method: "GET" })).rejects.toThrow("No mock data available for this endpoint.");
  });

  it("handles implementation errors and returns 500", async () => {
    const endpoint = "/test/endpoint4";
    const url = `https://example.com${endpoint}`;

    addEndpointMock(endpoint, "GET", () => {
      throw new Error("fail");
    });

    const response = await fetchMock(url, { method: "GET" });
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("supports string, URL, and { url } as input", async () => {
    const endpoint = "/test/endpoint5";
    const url = `https://example.com${endpoint}`;

    addEndpointMock(endpoint, "GET", () => {
      return { ok: 1 };
    });

    // string
    let response = await fetchMock(url, { method: "GET" });
    expect(response.status).toBe(200);

    // URL
    response = await fetchMock(new URL(url), { method: "GET" });
    expect(response.status).toBe(200);
  });

  it("defaults to GET method if not provided", async () => {
    const endpoint = "/test/endpoint6";
    const url = `https://example.com${endpoint}`;

    addEndpointMock(endpoint, "GET", () => {
      return { def: true };
    });

    const response = await fetchMock(url);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ def: true });
  });
});
