import {
  body,
  createEndpoint,
  method,
  prefix,
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

const createOAuth2Client = (opts: {
  debug?: boolean;
  credentials: { client_id: string; client_secret: string; audience: string };
}) => {
  const endpoint = createEndpoint([prefix("https://auth.example.com/oauth")]);

  let cachedToken: Token | null = null;
  const fetchToken = async (payload: {
    client_id: string;
    client_secret: string;
    audience: string;
    //...
  }) => {
    return endpoint<Token>("/token", [method("POST"), body(JSON.stringify(payload))]);
  };

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

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token.access_token}`);

    return fetchFn(input, {
      ...init,
      headers,
    });
  };
};

type ActionResponse = {
  hello: string;
};
const createApiSdk = (oauthClient: ReturnType<typeof createOAuth2Client>) => {
  const endpoint = createEndpoint([prefix("https://api.example.com"), bearerToken(oauthClient)]);
  return {
    someAction: async (param: number) => {
      return endpoint<ActionResponse>(`/some/path/${param}`, [method("GET")]);
    },
  };
};

const oauth = createOAuth2Client({
  credentials: {
    audience: "test",
    client_id: "asdasd",
    client_secret: "asdasdasd",
  },
});
const sdk = createApiSdk(oauth);

const result = await sdk.someAction(123);
console.log(result);
