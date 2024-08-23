import { z } from "zod";
import { body, method, query, type TEndpointDecTuple } from "@zemd/http-client";

const GetCommentsQuerySchema = z.object({
  as_md: z.coerce.boolean().optional(),
});

export interface GetCommentsQuery
  extends z.infer<typeof GetCommentsQuerySchema> {}

/**
 * Gets a list of comments left on the file.
 */
export const getComments = (
  key: string,
  options?: GetCommentsQuery,
): TEndpointDecTuple => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(
      query(GetCommentsQuerySchema.passthrough().parse(options)),
    );
  }
  return [`/v1/files/${key}/comments`, transformers];
};

const VectorSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const FrameOffsetSchema = z.object({
  node_id: z.string(),
  node_offset: VectorSchema,
});

const CommentPinCornerSchema = z
  .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
  .default("bottom-right");

const RegionSchema = z.object({
  x: z.number(),
  y: z.number(),
  region_height: z.number().positive(),
  region_width: z.number().positive(),
  comment_pin_corner: CommentPinCornerSchema.optional(),
});

const FrameOffsetRegionSchema = z.object({
  node_id: z.string(),
  node_offset: VectorSchema,
  region_height: z.number(),
  region_width: z.number(),
  comment_pin_corner: CommentPinCornerSchema.optional(),
});

export const PostCommentsQuerySchema = z.object({
  message: z.string(),
  comment_id: z.string().optional(),
  client_meta: z.union([
    VectorSchema,
    FrameOffsetSchema,
    RegionSchema,
    FrameOffsetRegionSchema,
  ]),
});

export interface PostCommentsQuery
  extends z.infer<typeof PostCommentsQuerySchema> {}

/**
 * Posts a new comment on the file.
 */
export const postComments = (
  key: string,
  message: PostCommentsQuery,
): TEndpointDecTuple => {
  return [
    `/v1/files/${key}/comments`,
    [
      method("POST"),
      body(
        JSON.stringify(PostCommentsQuerySchema.passthrough().parse(message)),
      ),
    ],
  ];
};

/**
 * Deletes a specific comment. Only the person who made the comment is allowed to delete it.
 */
export const deleteComments = (
  key: string,
  commendId: string,
): TEndpointDecTuple => {
  return [`/v1/files/${key}/comments/${commendId}`, [method("DELETE")]];
};

export const GetCommentsReactionsQuerySchema = z.object({
  cursor: z.string().optional(),
});

export interface GetCommentsReactionsQuery
  extends z.infer<typeof GetCommentsReactionsQuerySchema> {}

/**
 * Gets a paginated list of reactions left on the comment.
 */
export const getCommentsReactions = (
  key: string,
  commentId: string,
  options?: GetCommentsReactionsQuery,
): TEndpointDecTuple => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(
      query(GetCommentsReactionsQuerySchema.passthrough().parse(options)),
    );
  }
  return [`/v1/files/${key}/comments/${commentId}/reactions`, transformers];
};

export const PostCommentsReactionsQuerySchema = z.object({
  emoji: z.string(),
});

export interface PostCommentsReactionsQuery
  extends z.infer<typeof PostCommentsReactionsQuerySchema> {}

/**
 * Posts a new comment reaction on a file comment.
 */
export const postCommentsReactions = (
  key: string,
  commentId: string,
  options: PostCommentsReactionsQuery,
): TEndpointDecTuple => {
  return [
    `/v1/files/${key}/comments/${commentId}/reactions`,
    [
      method("POST"),
      body(
        JSON.stringify(
          PostCommentsReactionsQuerySchema.passthrough().parse(options),
        ),
      ),
    ],
  ];
};

/**
 * Deletes a specific comment reaction. Only the person who made the
 * comment reaction is allowed to delete it.
 */
export const deleteCommentsReactions = (
  key: string,
  commentId: string,
  options: PostCommentsReactionsQuery,
): TEndpointDecTuple => {
  return [
    `/v1/files/${key}/comments/${commentId}/reactions`,
    [
      method("DELETE"),
      query(PostCommentsReactionsQuerySchema.passthrough().parse(options)),
    ],
  ];
};
