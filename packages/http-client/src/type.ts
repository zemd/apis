export type TFetchFn = typeof fetch;
export type TFetchFnParams = Parameters<TFetchFn>;
export type TFetchTransformer = (fetchFn: TFetchFn, ...params: TFetchFnParams) => ReturnType<TFetchFn>;
