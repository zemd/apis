import {
  body,
  createBuildEndpointFn,
  method,
  type TFetchFn,
  type TFetchFnParams,
  type TFetchTransformer,
} from "./index.js";

type Token = {
  access_token: string;
  scope: string;
  expires_at: number;
};

const isExpired = (token: Token): boolean => {
  return token.expires_at - Date.now() < 0;
};

const tokenEndpoint = (payload: {
  client_id: string;
  client_secret: string;
  audience: string;
  //...
}) => {
  return {
    url: "/token",
    transformers: [method("POST"), body(JSON.stringify(payload))],
    responseParser: (json: any): Token => {
      return json;
    },
  };
};

const createOAuth2Client = (opts: {
  debug?: boolean;
  credentials: { client_id: string; client_secret: string; audience: string };
}) => {
  const build = createBuildEndpointFn({
    baseUrl: "https://auth.example.com/oauth",
    debug: !!opts.debug,
  });

  let cachedToken: Token | null = null;
  const fetchToken = build(tokenEndpoint);

  return {
    token: async (skipCache: boolean = false): Promise<Token> => {
      if (!cachedToken || skipCache || isExpired(cachedToken)) {
        const data = await fetchToken(opts.credentials);
        cachedToken = data;
      }
      return cachedToken;
    },
  };
};

const bearerToken = (oauthClient: ReturnType<typeof createOAuth2Client>): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...args: TFetchFnParams) => {
    const [input, init] = args;
    const token = await oauthClient.token();
    return fetchFn(input, {
      ...init,
      headers: {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...(Array.isArray(init?.headers) ? Object.fromEntries(init.headers) : init?.headers),
        Authorization: `Bearer ${token.access_token}`,
      },
    });
  };
};

function apiAction(param: number) {
  return {
    url: `/some/path/${param}`,
    transformers: [method("GET")],
  };
}

const createApiSdk = (oauthClient: ReturnType<typeof createOAuth2Client>, opts: { debug?: boolean } = {}) => {
  const build = createBuildEndpointFn({
    baseUrl: "https://api.example.com",
    transformers: [bearerToken(oauthClient)],
    debug: !!opts.debug,
  });
  return {
    someAction: build(apiAction),
  };
};

const oauth = createOAuth2Client({
  credentials: {
    audience: "test",
    client_id: "asdasd",
    client_secret: "asdasdasd",
  },
});
const sdk = createApiSdk(oauth, {});

const result = await sdk.someAction(123);
const json = await result.json();
console.log(json);
