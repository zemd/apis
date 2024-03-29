import { z } from "zod";
import { body, method, query, type TEndpointDec } from "@zemd/http-client";

export const GetDevResourcesQuerySchema = z.object({
  node_ids: z.string().optional(),
});

export interface GetDevResourcesQuery extends z.infer<typeof GetDevResourcesQuerySchema> {}

/**
 * Get dev resources in a file.
 */
export const getDevResources = (key: string, options?: GetDevResourcesQuery): TEndpointDec => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(query(GetDevResourcesQuerySchema.passthrough().parse(options)));
  }
  return [`/v1/files/${key}/dev_resources`, transformers];
};

const DevResourceCreate = z.object({
  name: z.string(),
  url: z.string(),
  file_key: z.string(),
  node_id: z.string(),
});

export const PostDevResourcesBodySchema = z.object({
  dev_resources: z.array(DevResourceCreate),
});

export interface PostDevResources extends z.infer<typeof PostDevResourcesBodySchema> {}

/**
 * Bulk create dev resources across multiple files.
 *
 * Dev resources that are successfully created will show up in
 * the links_created array in the response.
 *
 * If there are any dev resources that cannot be created, you may
 * still get a 200 response. These resources will show up in the
 * errors array. Some reasons a dev resource cannot be created
 * include:
 *
 * - Resource points to a file_key that cannot be found.
 * - The node already has the maximum of 10 dev resources.
 * - Another dev resource for the node has the same url.
 */
export const postDevResources = (options: PostDevResources): TEndpointDec => {
  return [
    `/v1/dev_resources`,
    [method("POST"), body(JSON.stringify(PostDevResourcesBodySchema.passthrough().parse(options)))],
  ];
};

const DevResourceUpdate = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export const PutDevResourcesBodySchema = z.object({
  dev_resources: z.array(DevResourceUpdate),
});

export interface PutDevResourcesBody extends z.infer<typeof PutDevResourcesBodySchema> {}

/**
 * Bulk update dev resources across multiple files.
 *
 * Ids for dev resources that are successfully updated will show up
 * in the links_updated array in the response.
 *
 * If there are any dev resources that cannot be updated, you may still
 * get a 200 response. These resources will show up in the errors array.
 */
export const putDevResources = (options: PutDevResourcesBody): TEndpointDec => {
  return [
    `/v1/dev_resources`,
    [method("PUT"), body(JSON.stringify(PutDevResourcesBodySchema.passthrough().parse(options)))],
  ];
};

/**
 * Delete a dev resources from a file.
 */
export const deleteDevResources = (key: string, devResourceId: string): TEndpointDec => {
  return [`/v1/files/${key}/dev_resources/${devResourceId}`, [method("DELETE")]];
};
