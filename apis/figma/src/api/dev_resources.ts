import { z } from "zod";
import { body, method, query, type TEndpointDec } from "@zemd/http-client";
import { IDS } from "../schema.js";

export const GetDevResourcesQuerySchema = z.object({
  node_ids: IDS.optional(),
});

export type GetDevResources = z.infer<typeof GetDevResourcesQuerySchema>;

/**
 * Get dev resources in a file.
 */
export const getDevResources = (
  key: string,
  options?: GetDevResources
): TEndpointDec => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(query(options));
  }
  return [`/v1/files/${key}/dev_resources`, transformers];
};

export const PostDevResourcesBodySchema = z.object({
  dev_resources: z.string().array(), // DevResourceCreate[]
});

export type PostDevResources = z.infer<typeof PostDevResourcesBodySchema>;

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
  return [`/v1/dev_resources`, [method("POST"), body(JSON.stringify(options))]];
};

/**
 * Bulk update dev resources across multiple files.
 *
 * Ids for dev resources that are successfully updated will show up
 * in the links_updated array in the response.
 *
 * If there are any dev resources that cannot be updated, you may still
 * get a 200 response. These resources will show up in the errors array.
 */
export const putDevResources = (options: PostDevResources): TEndpointDec => {
  return [`/v1/dev_resources`, [method("PUT"), body(JSON.stringify(options))]];
};

/**
 * Delete a dev resources from a file.
 */
export const deleteDevResources = (
  key: string,
  devResourceId: string
): TEndpointDec => {
  return [
    `/v1/files/${key}/dev_resources/${devResourceId}`,
    [method("DELETE")],
  ];
};
