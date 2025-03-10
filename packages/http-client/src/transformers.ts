import type { TFetchFn, TFetchFnParams, TFetchTransformer } from "./type";

const transform = async (fetchFn: TFetchFn, params: TFetchFnParams, input: RequestInit): Promise<Response> => {
  const [urlOrRequest, requestInit] = params;
  return fetchFn(urlOrRequest, {
    ...requestInit,
    ...input,
  });
};

/**
 * Set the HTTP method for the request.
 * @param name The HTTP method name (e.g., 'GET', 'POST', 'PUT', 'DELETE', etc.)
 * @returns A transformer function that sets the specified HTTP method
 */
export const method = (name: string): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams): Promise<Response> => {
    return transform(fetchFn, params, { method: name });
  };
};

/**
 * Add a header to the request.
 * @param key The header key
 * @param value The header value
 * @returns A transformer function that adds the specified header
 */
export const header = (key: string, value: string): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [urlOrRequest, requestInit] = params;

    const headers = new Headers(requestInit?.headers);
    headers.append(key, value);

    return fetchFn(
      urlOrRequest,
      Object.assign(requestInit ?? {}, {
        headers: Object.fromEntries(headers.entries()),
      }),
    );
  };
};

/**
 * Set the Content-Type header to 'application/json'.
 * @returns A transformer function that adds the JSON Content-Type header
 */
export const json = (): TFetchTransformer => {
  return header("Content-Type", "application/json");
};

const modifyUrlPath = (input: TFetchFnParams[0], prefix: string): TFetchFnParams[0] => {
  if (input instanceof Request) {
    const urlObj = new URL(input.url);
    urlObj.pathname = `${prefix}${urlObj.pathname}`;

    return new Request(urlObj.toString(), {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...input,
    });
  }

  if (input instanceof URL) {
    const urlObj = new URL(input.toString());
    urlObj.pathname = `${prefix}${urlObj.pathname}`;
    return urlObj;
  }

  // typeof input === 'string'
  if (URL.canParse(input)) {
    const urlObj = new URL(input);
    urlObj.pathname = `${prefix}${urlObj.pathname}`;
    return urlObj.toString();
  }

  return `${prefix}${input}`;
};

const modifyUrlQuery = (input: TFetchFnParams[0], query: object): TFetchFnParams[0] => {
  if (input instanceof Request) {
    const urlObj = new URL(input.url);
    urlObj.search = `${new URLSearchParams([...Array.from(urlObj.searchParams.entries()), ...Object.entries(query)])}`;
    return new Request(urlObj.toString(), {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...input,
    });
  }

  if (input instanceof URL) {
    const urlObj = new URL(input);
    urlObj.search = `${new URLSearchParams([...Array.from(urlObj.searchParams.entries()), ...Object.entries(query)])}`;
    return urlObj;
  }

  // typeof input === 'string'
  if (URL.canParse(input)) {
    const urlObj = new URL(input);
    urlObj.search = `${new URLSearchParams([...Array.from(urlObj.searchParams.entries()), ...Object.entries(query)])}`;
    return urlObj.toString();
  }

  const [pathname, search] = input.split("?");
  return `${pathname ?? ""}?${new URLSearchParams([...new URLSearchParams(search).entries(), ...Object.entries(query)])}`;
};

/**
 * Sets the URL prefix for the request.
 * @param input The path to be added to the URL path in the beginning
 * @returns A transformer function that adds the specified prefix
 */
export const prefix = (value: string): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [urlOrRequest, requestInit] = params;

    return fetchFn(modifyUrlPath(urlOrRequest, value), requestInit);
  };
};

/**
 * Adds query parameters to the request URL.
 * @param obj An object containing the query parameters as key-value pairs
 * @returns A transformer function that adds the specified query parameters to the URL
 */
export const query = (obj: object): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [urlOrRequest, requestInit] = params;
    return fetchFn(modifyUrlQuery(urlOrRequest, obj), requestInit);
  };
};

/**
 * Sets the request body.
 * @param obj The body to be sent with the request
 * @returns A transformer function that sets the specified body
 */
export const body = (obj: BodyInit): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [urlOrRequest, requestInit] = params;
    return fetchFn(
      urlOrRequest,
      Object.assign(requestInit ?? {}, {
        body: obj,
      }),
    );
  };
};

/**
 * Creates a transformer that retries failed requests.
 * @param maxRetries The maximum number of retry attempts (default: 3)
 * @param delay The delay between retries in milliseconds (default: 1000)
 * @returns A transformer function that retries the request on failure
 */
export const retry = (
  maxRetries: number = 3,
  delay: number = 1000,
  backoffFactor: number | ((attempt: number) => number) = 1,
): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    let lastError;
    for (let i = 0; i < maxRetries; i += 1) {
      try {
        return await fetchFn(...params);
      } catch (error) {
        lastError = error;
        // Calculate exponential backoff: delay * (2^attempt)
        const backoffDelay = delay * (typeof backoffFactor === "number" ? backoffFactor : backoffFactor(i));
        await new Promise((resolve) => {
          setTimeout(resolve, backoffDelay);
        });
      }
    }
    throw lastError;
  };
};

const cacheStore = new Map<string, { data: any; timestamp: number }>();

const getCacheKey = (input: string | URL | Request): string => {
  if (input instanceof Request) {
    return input.url;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input;
};

/**
 * Creates a transformer that caches GET requests for a specified duration.
 * CATION: The order of transformers is important. The cache transformer MUST go after the method transformer.
 *
 * @param maxAge The maximum age of the cache in milliseconds (default: 60000 ms or 1 minute)
 * @returns A transformer function that caches GET requests and returns cached responses if available
 */
export const cache = (maxAge: number = 60_000): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    if (init?.method?.toUpperCase() !== "GET") {
      return fetchFn(...params);
    }

    const cacheKey = getCacheKey(input);
    const cached = cacheStore.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < maxAge) {
      return new Response(JSON.stringify(cached.data), { status: 200 });
    }

    const response = await fetchFn(...params);
    const data = await response.json();
    cacheStore.set(cacheKey, { data, timestamp: Date.now() });
    return new Response(JSON.stringify(data), { status: 200 });
  };
};

const consoleDebug = (p: any) => {
  console.debug(JSON.stringify(p, null, 4));
};

/**
 * Creates a transformer that logs request parameters for debugging purposes.
 * @param fn Optional custom logging function (defaults to console.debug with JSON.stringify)
 * @returns A transformer function that logs the request parameters before passing them to the next transformer
 */
export const debug = (fn: Function = consoleDebug): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    fn(params);
    return fetchFn(...params);
  };
};
