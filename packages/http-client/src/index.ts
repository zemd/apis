export type TFetchFn = typeof fetch;
export type TFetchFnParams = Parameters<TFetchFn>;
export type TTransformer = (fetchFn: TFetchFn, ...params: TFetchFnParams) => ReturnType<TFetchFn>;

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
export const compose = (transformers: Array<TTransformer>, fetchFn: TFetchFn = fetch): TFetchFn => {
  return transformers.reduceRight<TFetchFn>((acc, transformer) => {
    const res: TFetchFn = (...params: TFetchFnParams) => {
      return transformer(acc, ...params);
    };
    return res;
  }, fetchFn);
};

export const method = (name: string): TTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      method: name,
    });
  };
};

export const header = (key: string, value: string): TTransformer => {
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

export const json = (): TTransformer => {
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

export const prefix = (value: string): TTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;

    return fetchFn(modifyUrlPath(input, value), init);
  };
};

export const query = (obj: object): TTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(modifyUrlQuery(input, obj), init);
  };
};

export const body = (obj: BodyInit): TTransformer => {
  return (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    const [input, init] = params;
    return fetchFn(input, {
      ...init,
      body: obj,
    });
  };
};

export const debug = (fn: Function = (p: any) => console.debug(JSON.stringify(p, null, 4))): TTransformer => {
  return async (fetchFn: TFetchFn, ...params: TFetchFnParams) => {
    fn(params);
    return fetchFn(...params);
  };
};

export type TEndpointDec = [string, Array<TTransformer>];

export type TEndpointDeclarationFn = (...params: Array<any>) => TEndpointDec;

export type TEndpointResFn<ArgEndpointDeclarationFnParams extends Array<any>> = (
  ...params: ArgEndpointDeclarationFnParams
) => Promise<Response>;

export const endpoint = <
  ArgEndpointDeclarationFn extends TEndpointDeclarationFn,
  ArgEndpointDeclarationFnParams extends Parameters<ArgEndpointDeclarationFn>,
  ArgResFn extends TEndpointResFn<ArgEndpointDeclarationFnParams>,
>(
  fn: ArgEndpointDeclarationFn,
): ArgResFn => {
  const res = (...params: ArgEndpointDeclarationFnParams): Promise<Response> => {
    const [url, transformers] = fn(...params);
    const fetchFn = compose(transformers, fetch);
    return fetchFn(url);
  };
  return res as ArgResFn;
};
