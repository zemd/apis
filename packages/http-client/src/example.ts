import {
  body,
  createBuildEndpointFn,
  method,
  type TEndpointDecTuple,
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
}): TEndpointDecTuple => {
  return ["/token", [method("POST"), body(JSON.stringify(payload))]];
};

const createOAuth2Client = (opts: {
  debug?: boolean;
  credentials: { client_id: string; client_secret: string; audience: string };
}) => {
  const build = createBuildEndpointFn({
    baseUrl: "https://auth.example.com/oauth",
    debug: !!opts.debug,
    exractJsonFromResponse: true,
  });

  let cachedToken: Token | null = null;
  const fetchToken = build(tokenEndpoint, (json: any): Token => {
    return json;
  });

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

const bearerToken = (
  oauthClient: ReturnType<typeof createOAuth2Client>,
): TFetchTransformer => {
  return async (fetchFn: TFetchFn, ...args: TFetchFnParams) => {
    const [input, init] = args;
    const token = await oauthClient.token();
    return fetchFn(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token.access_token}`,
      },
    });
  };
};

function apiAction(param: number): TEndpointDecTuple {
  return [`/some/path/${param}`, [method("GET")]];
}

const createApiSdk = (
  oauthClient: ReturnType<typeof createOAuth2Client>,
  opts: { debug?: boolean } = {},
) => {
  const build = createBuildEndpointFn({
    baseUrl: "https://api.example.com",
    transformers: [bearerToken(oauthClient)],
    debug: !!opts.debug,
    exractJsonFromResponse: false,
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
