export type TFetchFn = typeof fetch;
export type TFetchFnParams = Parameters<TFetchFn>;
export type TFetchTransformer = (fetchFn: TFetchFn, ...params: TFetchFnParams) => ReturnType<TFetchFn>;

/**
 * Compose a list of transformers into a single fetch function.
 * Example:
 *
 * ```
 * const POST = compose([
 *  method('POST'),
 *  json(),
 * ], fetch);
 * ```
 */
export const compose = (transformers: Array<TFetchTransformer>, fetchFn: TFetchFn = fetch): TFetchFn => {
  return transformers.reduceRight<TFetchFn>((acc, transformer) => {
    const res: TFetchFn = (...params: TFetchFnParams) => {
      return transformer(acc, ...params);
    };
    return res;
  }, fetchFn);
};

export const method = (name: string): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      method: name,
    });
  };
};

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

const modifyUrlPath = (input: TFetchFnParams[0], prefix: string): TFetchFnParams[0] => {
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

const modifyUrlQuery = (input: TFetchFnParams[0], query: object): TFetchFnParams[0] => {
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

export const prefix = (value: string): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;

    return fetchFn(modifyUrlPath(input, value), init);
  };
};

export const query = (obj: object): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(modifyUrlQuery(input, obj), init);
  };
};

export const body = (obj: BodyInit): TFetchTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      body: obj,
    });
  };
};

export const debug = (fn: Function = (p: any) => console.debug(JSON.stringify(p, null, 4))): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    fn(params);
    return fetchFn(...params);
  };
};

export type TEndpointDecTuple /*<ArgResult = any>*/ = [string, Array<TFetchTransformer>, ...any[]]; // [url, transformers, ...rest]

export type TEndpointDeclarationFn = (...params: Array<any>) => TEndpointDecTuple /*<any>*/;

export type TEndpointResFn<ArgEndpointDeclarationFnParams extends Array<any>, ArgResult = Response> = (
  ...params: ArgEndpointDeclarationFnParams
) => Promise<ArgResult>;

/**
 * Endpoint is a function identical to fetch with pre-defined parameters and input arguments.
 * Endpoint function follow the fetch logic, so it is unaware of the type that .json() method returns.
 * If you want have additional type-checking for the response, you can create another wrapper.
 * An example of such a wrapper see `createBuildEndpointFn` function.
 */
export const endpoint = <
  ArgEndpointDeclarationFn extends TEndpointDeclarationFn,
  ArgEndpointDeclarationFnParams extends Parameters<ArgEndpointDeclarationFn>,
  ArgResFn extends TEndpointResFn<ArgEndpointDeclarationFnParams>,
>(
  fn: ArgEndpointDeclarationFn,
): ArgResFn => {
  const res = (...params: ArgEndpointDeclarationFnParams): Promise<Response> => {
    const declaration = fn(...params);
    const [url, transformers] = declaration;
    const fetchFn = compose(transformers, fetch);
    return fetchFn(url);
  };
  return res as ArgResFn;
};

type TCreateBuildOptions<ArgExtractJsonType> = {
  baseUrl: string;
  transformers?: Array<TFetchTransformer>;
  debug?: boolean;
  exractJsonFromResponse?: ArgExtractJsonType;
};

/**
 * Creates a build function that wraps endpoint function and provides common transformers,
 * and handles some configuration options that can ease the development.
 * Is not required to use, and can be used as an example for custom build function.
 */
export const createBuildEndpointFn = <ArgExtractJsonType extends boolean>({
  baseUrl,
  exractJsonFromResponse,
  ...opts
}: TCreateBuildOptions<ArgExtractJsonType>) => {
  return <
    ArgFn extends TEndpointDeclarationFn,
    ArgMapOrValidateFn extends (...args: any[]) => any,
    ArgResult extends ArgExtractJsonType extends true
      ? ArgMapOrValidateFn extends undefined
        ? never
        : ReturnType<ArgMapOrValidateFn>
      : Response,
  >(
    fn: ArgFn,
    mapOrValidateJSON?: ArgMapOrValidateFn,
  ): TEndpointResFn<Parameters<ArgFn>, ArgResult> => {
    const commonTransformers: Array<TFetchTransformer> = [prefix(baseUrl), json()];
    if (opts.debug) {
      commonTransformers.push(debug());
    }

    const endpointDecFn = (...params: Parameters<ArgFn>): TEndpointDecTuple => {
      const [path, transformers, ...rest] = fn(...params);
      return [path, [...commonTransformers, ...(opts.transformers ?? []), ...transformers], ...rest];
    };

    if (exractJsonFromResponse) {
      return async (...params: Parameters<ArgFn>): Promise<ArgResult> => {
        const res = await endpoint(endpointDecFn as ArgFn)(...params);
        if (mapOrValidateJSON) {
          return mapOrValidateJSON(res.json());
        }
        return res.json() as ArgResult;
      };
    }

    return endpoint(endpointDecFn as ArgFn) as TEndpointResFn<Parameters<ArgFn>, ArgResult>;
  };
};
