import * as photosets from "./api/photosets.js";
import * as activity from "./api/activity.js";
import { query, createBuildEndpointFn } from "@zemd/http-client";

export const flickr = (
  apiKey: string,
  opts?: { url?: string; debug?: boolean },
) => {
  const build = createBuildEndpointFn({
    baseUrl: opts?.url ?? "https://api.flickr.com/services/rest",
    transformers: [
      query({ api_key: apiKey, format: "json", nojsoncallback: 1 }),
    ],
    debug: !!opts?.debug,
  });

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
    activity: {
      userComments: build(activity.userComments),
      userPhotos: build(activity.userPhotos),
    },
  };
};
