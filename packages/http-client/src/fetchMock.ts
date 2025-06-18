import type { TFetchFnParams } from "./type";

const mockRegistry = new Map<string, (url: URL, options?: TFetchFnParams[1]) => unknown>();

const getUrl = (url: TFetchFnParams[0]) => {
  if (url instanceof URL) {
    return url;
  }
  if (typeof url === "string") {
    return new URL(url);
  }
  return new URL(url.url);
};

const getKey = (pathname: string, method: string): string => {
  for (const key of mockRegistry.keys()) {
    if (new RegExp(`^${key}$`).test(`${method}\.${pathname}`)) {
      return key;
    }
  }
  return "";
};

/**
 * Example usage:
 * ```ts
 * import { compose, prefix, method, json, fetchMock } from "@zemd/http-client";
 *
 * const mockData = true;
 *
 * const apiEndpoint = compose([
 *    prefix('/my/api/endpoint'),
 *    method('GET'),
 *    json()
 * ], mockData ? fetchMock : fetch);
 * ```
 */
export const fetchMock = async (url: TFetchFnParams[0], options?: TFetchFnParams[1]): Promise<Response> => {
  const method = options?.method || "GET";
  const urlObj = getUrl(url);

  const implementation =
    mockRegistry.get(getKey(`${urlObj.origin}${urlObj.pathname}`, method)) ??
    mockRegistry.get(getKey(`${urlObj.pathname}`, method));

  if (implementation) {
    try {
      const result = await implementation(urlObj, options);
      if (result instanceof Response) {
        return result;
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error in mock implementation for the URL: ${url.toString()}`, error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  throw new Error("No mock data available for this endpoint.");
};

export const addEndpointMock = (
  pathname: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD",
  implementation: (url: URL, options?: TFetchFnParams[1]) => unknown,
) => {
  mockRegistry.set(`${method.toUpperCase()}.${pathname}`, implementation);
};
