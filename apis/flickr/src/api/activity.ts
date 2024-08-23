import { method, query, type TEndpointDecTuple } from "@zemd/http-client";
import { z } from "zod";

export const GetUserCommentsQuerySchema = z.object({
  per_page: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe(
      "Number of items to return per page. If this argument is omitted, it defaults to 10. The maximum allowed value is 50.  ",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "The page of results to return. If this argument is omitted, it defaults to 1.",
    ),
});

export interface GetUserCommentsQuery
  extends z.infer<typeof GetUserCommentsQuerySchema> {}
/**
 * Returns a list of recent activity on photos commented on by the calling user.
 * Do not poll this method more than once an hour.
 */
export const userComments = (
  params: GetUserCommentsQuery,
): TEndpointDecTuple => {
  return [
    `/`,
    [
      method("GET"),
      query(GetUserCommentsQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.activity.userComments" }),
    ],
  ];
};

export const GetUserPhotosQuerySchema = z.object({
  timeframe: z
    .string()
    .regex(/^\d+(d|h)$/)
    .optional()
    .describe(
      "The timeframe in which to return updates for. This can be specified in days ('2d') or hours ('4h'). The default behavoir is to return changes since the beginning of the previous user session.",
    ),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe(
      "Number of items to return per page. If this argument is omitted, it defaults to 10. The maximum allowed value is 50.",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "The page of results to return. If this argument is omitted, it defaults to 1.",
    ),
});

export interface GetUserPhotosQuery
  extends z.infer<typeof GetUserPhotosQuerySchema> {}

export const userPhotos = (params: GetUserPhotosQuery): TEndpointDecTuple => {
  return [
    `/`,
    [
      method("GET"),
      query(GetUserPhotosQuerySchema.passthrough().parse(params)),
      query({ method: "flickr.activity.userPhotos" }),
    ],
  ];
};
