import * as photosets from "./api/photosets.js";
import {
  debug,
  endpoint,
  json,
  prefix,
  query,
  type TEndpointDec,
  type TEndpointDeclarationFn,
  type TEndpointResFn,
  type TTransformer,
} from "@zemd/http-client";

export const flickr = (apiKey: string, opts?: { url?: string; debug?: boolean }) => {
  const build = <ArgFn extends TEndpointDeclarationFn, ArgFnParams extends Parameters<ArgFn>>(
    fn: ArgFn,
  ): TEndpointResFn<ArgFnParams> => {
    const globalTransformers: Array<TTransformer> = [
      prefix(opts?.url ?? "https://api.flickr.com/services/rest"),
      query({ api_key: apiKey, format: "json", nojsoncallback: 1 }),
      json(),
    ];

    if (opts?.debug === true) {
      globalTransformers.push(debug());
    }

    const endpointDecFn = (...params: ArgFnParams): TEndpointDec => {
      const [path, transformers]: TEndpointDec = fn(...params);
      return [path, [...transformers, ...globalTransformers]];
    };

    return endpoint(endpointDecFn as ArgFn);
  };

  return {
    photosets: {
      getPhotos: build(photosets.getPhotos),
      addPhoto: build(photosets.addPhoto),
      create: build(photosets.createPhotoset),
      delete: build(photosets.deletePhotoset),
      editMeta: build(photosets.editMeta),
      editPhotos: build(photosets.editPhotos),
      getContext: build(photosets.getContext),
      getInfo: build(photosets.getInfo),
      getList: build(photosets.getList),
      orderSets: build(photosets.orderSets),
      removePhoto: build(photosets.removePhoto),
      removePhotos: build(photosets.removePhotos),
      reorderPhotos: build(photosets.reorderPhotos),
      setPrimaryPhoto: build(photosets.setPrimaryPhoto),
    },
  };
};
