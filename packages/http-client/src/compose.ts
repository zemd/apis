import type { TFetchFn, TFetchFnParams, TFetchTransformer } from "./type.js";

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
export const compose = (transformers: Array<TFetchTransformer>, fetchFn: TFetchFn = fetch): TFetchFn => {
  return transformers.reduceRight<TFetchFn>((pFetch, transformer) => {
    const res: TFetchFn = async (...params: TFetchFnParams) => {
      return transformer(pFetch, ...params);
    };
    return res;
  }, fetchFn);
};
