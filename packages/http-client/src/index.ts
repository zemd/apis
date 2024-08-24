export type TFetchFn = typeof fetch;
export type TFetchFnParams = Parameters<TFetchFn>;
export type TFetchTransformer = (
  fetchFn: TFetchFn,
  ...params: TFetchFnParams
) => ReturnType<TFetchFn>;

/**
  * Composes a list of transformers into a single fetch function.
  * Example:
  * ```
  * const POST = compose([
  *  method('POST'),
  *  json(),
  * ], fetch);
  * ```

  * @param transformers An array of transformer functions to be applied
  * @param fetchFn The base fetch function to be transformed (defaults to global fetch)
  * @returns A new fetch function that applies all the transformers in order
  */
export const compose = (
  transformers: Array<TFetchTransformer>,
  fetchFn: TFetchFn = fetch,
): TFetchFn => {
  return transformers.reduceRight<TFetchFn>((acc, transformer) => {
    const res: TFetchFn = (...params: TFetchFnParams) => {
      return transformer(acc, ...params);
    };
    return res;
  }, fetchFn);
};

/**
 * Set the HTTP method for the request.
 * @param name The HTTP method name (e.g., 'GET', 'POST', 'PUT', 'DELETE', etc.)
 * @returns A transformer function that sets the specified HTTP method
 */
export const method = (name: string): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      method: name,
    });
  };
};

/**
 * Add a header to the request.
 * @param key The header key
 * @param value The header value
 * @returns A transformer function that adds the specified header
 */
export const header = (key: string, value: string): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      headers: {
        ...init?.headers,
        [key]: value,
      },
    });
  };
};

/**
 * Set the Content-Type header to 'application/json'.
 * @returns A transformer function that adds the JSON Content-Type header
 */
export const json = (): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
      },
    });
  };
};

const modifyUrlPath = (
  input: TFetchFnParams[0],
  prefix: string,
): TFetchFnParams[0] => {
  if (input instanceof Request) {
    const urlObj = new URL(input.url);
    urlObj.pathname = `${prefix}${urlObj.pathname}`;

    return new Request(urlObj.toString(), {
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

const modifyUrlQuery = (
  input: TFetchFnParams[0],
  query: object,
): TFetchFnParams[0] => {
  if (input instanceof Request) {
    const urlObj = new URL(input.url);
    urlObj.search = `${new URLSearchParams([...Array.from(urlObj.searchParams.entries()), ...Object.entries(query)])}`;
    return new Request(urlObj.toString(), {
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
  return `${pathname}?${new URLSearchParams([...new URLSearchParams(search).entries(), ...Object.entries(query)])}`;
};

/**
 * Sets the URL prefix for the request.
 * @param input The path to be added to the URL path in the beginning
 * @returns A transformer function that adds the specified prefix
 */
export const prefix = (value: string): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;

    return fetchFn(modifyUrlPath(input, value), init);
  };
};

/**
 * Adds query parameters to the request URL.
 * @param obj An object containing the query parameters as key-value pairs
 * @returns A transformer function that adds the specified query parameters to the URL
 */
export const query = (obj: object): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(modifyUrlQuery(input, obj), init);
  };
};

/**
 * Sets the request body.
 * @param obj The body to be sent with the request
 * @returns A transformer function that sets the specified body
 */
export const body = (obj: BodyInit): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      body: obj,
    });
  };
};

/**
 * Creates a transformer that logs request parameters for debugging purposes.
 * @param fn Optional custom logging function (defaults to console.debug with JSON.stringify)
 * @returns A transformer function that logs the request parameters before passing them to the next transformer
 */
export const debug = (
  fn: Function = (p: any) => console.debug(JSON.stringify(p, null, 4)),
): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    fn(params);
    return fetchFn(...params);
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
): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    let lastError;
    for (let i = 0; i < maxRetries; i += 1) {
      try {
        return await fetchFn(...params);
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delay));
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
export const cache = (maxAge: number = 60000): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    if (init?.method?.toUpperCase() !== "GET") {
      return fetchFn(...params);
    }

    const cacheKey = getCacheKey(input);
    const cached = cacheStore.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < maxAge) {
      return Promise.resolve(
        new Response(JSON.stringify(cached.data), { status: 200 }),
      );
    }

    const response = await fetchFn(...params);
    const data = await response.json();
    cacheStore.set(cacheKey, { data, timestamp: Date.now() });
    return new Response(JSON.stringify(data), { status: 200 });
  };
};

/**
 * Represents the specification for declaring an endpoint.
 */
export type TEndpointDeclarationSpec = {
  url: string;
  transformers: Array<TFetchTransformer>;
  responseParser?: (data: any) => any;
};

/**
 * Represents a function that declares an endpoint.
 * This function takes any number of parameters and returns a TEndpointDeclarationSpec.
 */
export type TEndpointDeclarationFn = (
  ...params: Array<any>
) => TEndpointDeclarationSpec;

export type TEndpointReturnFn<
  ArgEndpointDeclarationFnParams extends Array<any>,
  ArgResult = Response,
> = (...params: ArgEndpointDeclarationFnParams) => Promise<ArgResult>;

/**
 * Creates an endpoint function based on the provided declaration function.
 * NOTE: Endpoint - is a function that executes a request with the specified parameters and
 *                  returns a Promise of the result.
 *
 * @param fn The endpoint declaration function
 * @param parseResponse The response parsing method, either 'json' or 'text' (default: 'json')
 * @returns A function that executes the endpoint with the given parameters and returns a Promise of the result
 */
export const endpoint = <
  ArgDecFn extends TEndpointDeclarationFn,
  ArgParams extends Parameters<ArgDecFn>,
  ReturnSpec extends ReturnType<ArgDecFn>,
  ArgResult = ReturnSpec["responseParser"] extends (data: any) => infer R
    ? R
    : Response,
>(
  fn: ArgDecFn,
  parseResponse: "json" | "text" = "json",
): TEndpointReturnFn<ArgParams, ArgResult> => {
  const res = async (...params: ArgParams): Promise<ArgResult> => {
    const declaration = fn(...params);
    const { url, transformers, responseParser } = declaration;
    const fetchFn = compose(transformers, fetch);
    const response = await fetchFn(url);
    if (typeof responseParser === "function") {
      const parsed = await response[parseResponse]();
      return responseParser(parsed);
    }
    return response as ArgResult;
  };
  return res;
};

type TCreateBuildOptions = {
  baseUrl: string;
  transformers?: Array<TFetchTransformer>;
  debug?: boolean;
};

/**
 * Creates a function to build endpoints with common configurations. This is utility function that is
 * not mandatory to use, but can help to reduce boilerplate code.
 *
 * @param options An object containing configuration options:
 *   - baseUrl: The base URL for all endpoints
 *   - transformers: Optional array of additional transformers to apply to all endpoints
 *   - debug: Optional flag to enable debug logging for all endpoints
 *
 * @returns A function that takes an endpoint declaration function and returns a configured endpoint
 */
export const createBuildEndpointFn = ({
  baseUrl,
  ...opts
}: TCreateBuildOptions) => {
  return <ArgDecFn extends TEndpointDeclarationFn>(fn: ArgDecFn) => {
    const commonTransformers: Array<TFetchTransformer> = [
      prefix(baseUrl),
      json(),
    ];
    if (opts.debug) {
      commonTransformers.push(debug());
    }

    const endpointDecFn = (...params: Parameters<ArgDecFn>) => {
      const { url, transformers, ...rest } = fn(...params);
      return {
        url,
        transformers: [
          ...commonTransformers,
          ...(opts.transformers ?? []),
          ...transformers,
        ],
        ...rest,
      };
    };

    return endpoint(endpointDecFn as ArgDecFn, "json");
  };
};
