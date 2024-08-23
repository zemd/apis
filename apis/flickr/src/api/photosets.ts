import { method, query, type TEndpointDecTuple } from "@zemd/http-client";
import { z } from "zod";

const PRIVACY_FILTER_PUBLIC_PHOTOS = "1";
const PRIVACY_FILTER_PRIVATE_FRIENDS = "2";
const PRIVACY_FILTER_PRIVATE_FAMILY = "3";
const PRIVACY_FILTER_PRIVATE_FRIENDS_AND_FAMILY = "4";
const PRIVACY_FILTER_PRIVATE = "5";
const PRIVACY_FILTER = [
  PRIVACY_FILTER_PUBLIC_PHOTOS,
  PRIVACY_FILTER_PRIVATE_FRIENDS,
  PRIVACY_FILTER_PRIVATE_FAMILY,
  PRIVACY_FILTER_PRIVATE_FRIENDS_AND_FAMILY,
  PRIVACY_FILTER_PRIVATE,
] as const;

export const GetPhotosQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe("The id of the photoset to return the photos for."),
  user_id: z
    .string()
    .describe(
      "The user_id here is the owner of the set passed in photoset_id.",
    ),
  // TODO: implement validation and transform
  extras: z
    .string()
    .optional()
    .describe(
      "A comma-delimited list of extra information to fetch for each returned record. Currently supported fields are: license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o",
    ),
  per_page: z
    .number()
    .int()
    .max(500)
    .min(1)
    .default(500)
    .optional()
    .describe(
      "Number of photos to return per page. If this argument is omitted, it defaults to 500. The maximum allowed value is 500.",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "The page of results to return. If this argument is omitted, it defaults to 1.",
    ),
  privacy_filter: z
    .enum(PRIVACY_FILTER)
    .optional()
    .describe(
      "Return photos only matching a certain privacy level. This only applies when making an authenticated call to view a photoset you own.",
    ),
  media: z
    .enum(["all", "photos", "videos"])
    .default("all")
    .optional()
    .describe("Filter results by media type."),
});

export interface GetPhotosQuery extends z.infer<typeof GetPhotosQuerySchema> {}

/**
 * Get the list of photos in a set.
 */
export const getPhotos = (params: GetPhotosQuery): TEndpointDecTuple => {
  return [
    `/`,
    [
      method("GET"),
      query(GetPhotosQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.getPhotos" }),
    ],
  ];
};

export const AddPhotoQuerySchema = z.object({
  photoset_id: z.string(),
  photo_id: z.string(),
});

export interface AddPhotoQuery extends z.infer<typeof AddPhotoQuerySchema> {}

/**
 * Add a photo to the end of an existing photoset.
 */
export const addPhoto = (params: AddPhotoQuery): TEndpointDecTuple => {
  return [
    `/`,
    [
      method("GET"),
      query(AddPhotoQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.addPhoto" }),
    ],
  ];
};

export const CreatePhotosetQuerySchema = z.object({
  title: z.string().describe("A title for the photoset."),
  primary_photo_id: z
    .string()
    .describe(
      "The id of the photo to represent this set. The photo must belong to the calling user.",
    ),
  description: z
    .string()
    .optional()
    .describe("A description of the photoset. May contain limited html."),
});

export interface CreateQuery
  extends z.infer<typeof CreatePhotosetQuerySchema> {}

/**
 * Create a new photoset for the calling user.
 */
export const createPhotoset = (params: CreateQuery): TEndpointDecTuple => {
  return [
    "/",
    [
      method("GET"),
      query(CreatePhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.create" }),
    ],
  ];
};

export const DeletePhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe(
      "The id of the photoset to delete. It must be owned by the calling user.",
    ),
});

export interface DeletePhotosetQuery
  extends z.infer<typeof DeletePhotosetQuerySchema> {}

/**
 * Delete a photoset.
 */
export const deletePhotoset = (
  params: DeletePhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("GET"),
      query(DeletePhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.delete" }),
    ],
  ];
};

export const EditMetaPhotosetQuerySchema = z.object({
  photoset_id: z.string().describe("The id of the photoset to modify."),
  title: z.string().describe("The new title for the photoset."),
  description: z
    .string()
    .describe("A description of the photoset. May contain limited html."),
});

export interface EditMetaPhotosetQuery
  extends z.infer<typeof EditMetaPhotosetQuerySchema> {}

/**
 * Modify the meta-data for a photoset.
 */
export const editMeta = (params: EditMetaPhotosetQuery): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(EditMetaPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.editMeta" }),
    ],
  ];
};

export const EditPhotosPhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe(
      "The id of the photoset to modify. The photoset must belong to the calling user.",
    ),
  primary_photo_id: z
    .string()
    .describe(
      "The id of the photo to use as the 'primary' photo for the set. This id must also be passed along in photo_ids list argument.",
    ),
  photo_ids: z
    .string()
    .describe(
      "A comma-delimited list of photo ids to include in the set. They will appear in the set in the order sent. This list must contain the primary photo id. All photos must belong to the owner of the set. This list of photos replaces the existing list. Call flickr.photosets.addPhoto to append a photo to a set.",
    ),
});

export interface EditPhotosPhotosetQuery
  extends z.infer<typeof EditPhotosPhotosetQuerySchema> {}

/**
 * Modify the photos in a photoset. Use this method to add, remove and re-order photos.
 */
export const editPhotos = (
  params: EditPhotosPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(EditPhotosPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.editPhotos" }),
    ],
  ];
};

export const GetContextPhotosetQuerySchema = z.object({
  photo_id: z
    .string()
    .describe("The id of the photo to fetch the context for."),
  photoset_id: z
    .string()
    .describe("The id of the photoset for which to fetch the photo's context."),
});

export interface GetContextPhotosetQuery
  extends z.infer<typeof GetContextPhotosetQuerySchema> {}

/**
 * Returns next and previous photos for a photo in a set.
 */
export const getContext = (
  params: GetContextPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("GET"),
      query(GetContextPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.getContext" }),
    ],
  ];
};

export const GetInfoPhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe("The ID of the photoset to fetch information for."),
  user_id: z
    .string()
    .describe(
      "The user_id here is the owner of the set passed in photoset_id.",
    ),
});

export interface GetInfoPhotosetQuery
  extends z.infer<typeof GetInfoPhotosetQuerySchema> {}

/**
 * Gets information about a photoset.
 */
export const getInfo = (params: GetInfoPhotosetQuery): TEndpointDecTuple => {
  return [
    "/",
    [
      method("GET"),
      query(GetInfoPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.getInfo" }),
    ],
  ];
};

export const GetListPhotosetQuerySchema = z.object({
  user_id: z
    .string()
    .optional()
    .describe(
      "The NSID of the user to get a photoset list for. If none is specified, the calling user is assumed.",
    ),
  page: z
    .string()
    .optional()
    .describe(
      "The page of results to get. Currently, if this is not provided, all sets are returned, but this behaviour may change in future.",
    ),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe(
      "The number of sets to get per page. If paging is enabled, the maximum number of sets per page is 500.",
    ),
  // TODO: implement validation and transform
  primary_photo_extras: z
    .string()
    .optional()
    .describe(
      "A comma-delimited list of extra information to fetch for the primary photo. Currently supported fields are: license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o",
    ),
  photo_ids: z
    .string()
    .optional()
    .describe(
      "A comma-separated list of photo ids. If specified, each returned set will include a list of these photo ids that are present in the set as 'has_requested_photos'",
    ),
  sort_groups: z
    .string()
    .optional()
    .describe(
      "A comma-separated list of groups used to sort the output sets. If has_photo is present, any of the calling user's galleries containing photos referred to in photo_ids will be returned before other galleries. The order of the sort_groups will dictate the order that the groups are returned in. Only available if continuation is used. The resulting output will include a 'sort_group' parameter indicating the sort_group that each set is part of, or null if not applicable",
    ),
});

export interface GetListPhotosetQuery
  extends z.infer<typeof GetListPhotosetQuerySchema> {}

/**
 * Returns the photosets belonging to the specified user.
 */
export const getList = (params: GetListPhotosetQuery): TEndpointDecTuple => {
  return [
    "/",
    [
      method("GET"),
      query(GetListPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.getList" }),
    ],
  ];
};

export const OrderSetsPhotosetQuerySchema = z.object({
  photoset_ids: z
    .string()
    .describe(
      "A comma delimited list of photoset IDs, ordered with the set to show first, first in the list. Any set IDs not given in the list will be set to appear at the end of the list, ordered by their IDs.",
    ),
});

export interface OrderSetsPhotosetQuery
  extends z.infer<typeof OrderSetsPhotosetQuerySchema> {}

/**
 * Set the order of photosets for the calling user.
 */
export const orderSets = (
  params: OrderSetsPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(OrderSetsPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.orderSets" }),
    ],
  ];
};

export const RemovePhotoPhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe("The id of the photoset to remove a photo from."),
  photo_id: z.string().describe("The id of the photo to remove from the set"),
});

export interface RemovePhotoPhotosetQuery
  extends z.infer<typeof RemovePhotoPhotosetQuerySchema> {}

/**
 * Remove a photo from a photoset.
 */
export const removePhoto = (
  params: RemovePhotoPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(RemovePhotoPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.removePhoto" }),
    ],
  ];
};

export const RemovePhotosPhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe("The id of the photoset to remove photos from."),
  photo_ids: z
    .string()
    .describe("Comma-delimited list of photo ids to remove from the photoset."),
});

export interface RemovePhotosPhotosetQuery
  extends z.infer<typeof RemovePhotosPhotosetQuerySchema> {}

/**
 * Remove multiple photos from a photoset.
 */
export const removePhotos = (
  params: RemovePhotosPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(RemovePhotosPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.removePhotos" }),
    ],
  ];
};

export const ReorderPhotosPhotosetQuerySchema = z.object({
  photoset_id: z
    .string()
    .describe(
      "The id of the photoset to reorder. The photoset must belong to the calling user.",
    ),
  photo_ids: z
    .string()
    .describe(
      "Ordered, comma-delimited list of photo ids. Photos that are not in the list will keep their original order.",
    ),
});

export interface ReorderPhotosPhotosetQuery
  extends z.infer<typeof ReorderPhotosPhotosetQuerySchema> {}

export const reorderPhotos = (
  params: ReorderPhotosPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(ReorderPhotosPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.reorderPhotos" }),
    ],
  ];
};

export const SetPrimaryPhotoPhotosetQuerySchema = z.object({});

export interface SetPrimaryPhotoPhotosetQuery
  extends z.infer<typeof SetPrimaryPhotoPhotosetQuerySchema> {}

/**
 * Set photoset primary photo
 */
export const setPrimaryPhoto = (
  params: SetPrimaryPhotoPhotosetQuery,
): TEndpointDecTuple => {
  return [
    "/",
    [
      method("POST"),
      query(SetPrimaryPhotoPhotosetQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.photosets.setPrimaryPhoto" }),
    ],
  ];
};
