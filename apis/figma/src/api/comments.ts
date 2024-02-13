import { z } from "zod";
import { body, method, query, type TEndpointDec } from "@zemd/http-client";

const GetCommentsSchema = z.object({
  as_md: z.coerce.boolean().optional(),
});

type GetComments = z.infer<typeof GetCommentsSchema>;

/**
 * Gets a list of comments left on the file.
 */
export const getComments = (
  key: string,
  options?: GetComments
): TEndpointDec => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(query(options));
  }
  return [`/v1/files/${key}/comments`, transformers];
};

export const PostCommentsSchema = z.object({
  message: z.string(),
  comment_id: z.string().optional(),
  // client_meta: Vector | FrameOffset | Region | FrameOffsetRegion
});

export type PostComments = z.infer<typeof PostCommentsSchema>;

/**
 * Posts a new comment on the file.
 */
export const postComments = (
  key: string,
  message: PostComments
): TEndpointDec => {
  return [
    `/v1/files/${key}/comments`,
    [method("POST"), body(JSON.stringify(message))],
  ];
};

/**
 * Deletes a specific comment. Only the person who made the comment is allowed to delete it.
 */
export const deleteComments = (
  key: string,
  commendId: string
): TEndpointDec => {
  return [`/v1/files/${key}/comments/${commendId}`, [method("DELETE")]];
};

export const GetCommentsReactionsQuerySchema = z.object({
  cursor: z.string().optional(),
});

export type GetCommentsReactionsQuery = z.infer<
  typeof GetCommentsReactionsQuerySchema
>;

/**
 * Gets a paginated list of reactions left on the comment.
 */
export const getCommentsReactions = (
  key: string,
  commentId: string,
  options?: GetCommentsReactionsQuery
): TEndpointDec => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(query(options));
  }
  return [`/v1/files/${key}/comments/${commentId}/reactions`, transformers];
};

export const PostCommentsReactionsQuerySchema = z.object({
  emoji: z.string(),
});

export type PostCommentsReactions = z.infer<
  typeof PostCommentsReactionsQuerySchema
>;

/**
 * Posts a new comment reaction on a file comment.
 */
export const postCommentsReactions = (
  key: string,
  commentId: string,
  options: PostCommentsReactions
): TEndpointDec => {
  return [
    `/v1/files/${key}/comments/${commentId}/reactions`,
    [method("POST"), body(JSON.stringify(options))],
  ];
};

/**
 * Deletes a specific comment reaction. Only the person who made the
 * comment reaction is allowed to delete it.
 */
export const deleteCommentsReactions = (
  key: string,
  commentId: string,
  options: PostCommentsReactions
): TEndpointDec => {
  return [
    `/v1/files/${key}/comments/${commentId}/reactions`,
    [method("DELETE"), query(options)],
  ];
};
