import { compose } from "./compose";
import type { TFetchFn, TFetchTransformer } from "./type";

type TEndpointOptions = {
  parseResponse: "json" | "text" | false;
};

const waitFetch = async <ArgResponseType>(
  fetch: Promise<Response>,
  {
    parseResponse,
  }:
    | ({ parseResponse: "json" } & (ArgResponseType extends object ? {} : never))
    | ({ parseResponse: "text" } & (ArgResponseType extends string ? {} : never))
    | ({ parseResponse: false } & (ArgResponseType extends Response ? {} : never)),
): Promise<ArgResponseType> => {
  const response = await fetch;
  if (!response.ok) {
    throw new Error(`HTTP error occur. status: ${response.status}, url: ${response.url}`, {
      cause: {
        response,
      },
    });
  }
  if (parseResponse === "json") {
    return (await response.json()) as ArgResponseType;
  }
  if (parseResponse === "text") {
    return (await response.text()) as ArgResponseType;
  }
  return response as any;
};

export const createEndpoint = (
  transformers: TFetchTransformer[],
  options: TEndpointOptions = { parseResponse: "json" },
  fetchFn: TFetchFn = fetch,
) => {
  return async <ResultType = Response>(url: string, endpointTransformers: TFetchTransformer[]) => {
    return waitFetch<ResultType>(compose(transformers.concat(endpointTransformers), fetchFn)(url), options);
  };
};
