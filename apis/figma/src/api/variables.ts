import { z } from "zod";
import { body, method, type TEndpointDec } from "@zemd/http-client";

/**
 * This API is available to full members of Enterprise orgs.
 *
 * The GET /v1/files/:file_key/variables/local endpoint lets you
 * enumerate local variables created in the file and remote variables
 * used in the file. Remote variables are referenced by their subscribed_id.
 *
 * As a part of the Variables related API additions, the
 * GET /v1/files/:file_key endpoint now returns a boundVariables property,
 * containing the variableId of the bound variable. The
 * GET /v1/files/:file_key/variables/local endpoint can be used to get the
 * full variable or variable collection object.
 *
 * Note that GET /v1/files/:file_key/variables/published does not return modes.
 * Instead, you will need to use the GET /v1/files/:file_key/variables/local
 * endpoint, in the same file, to examine the mode values.
 */
export const getLocalVariables = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/variables/local`, [method("GET")]];
};

/**
 * This API is available to full members of Enterprise orgs.
 *
 * The GET /v1/files/:file_key/variables/published endpoint returns the variables
 * that are published from the given file.
 *
 * The response for this endpoint contains some key differences compared
 * to the GET /v1/files/:file_key/variables/local endpoint:
 *
 * - Each variable and variable collection contains a subscribed_id.
 * - Modes are omitted for published variable collections
 *
 * Published variables have two ids: an id that is assigned in the file where
 * it is created (id), and an id that is used by subscribing files (subscribed_id).
 * The id and key are stable over the lifetime of the variable. The subscribed_id
 * changes every time the variable is modified and published. The same is true for
 * variable collections.
 *
 * The updatedAt fields are ISO 8601 timestamps that indicate the last time that a
 * change to a variable was published. For variable collections, this timestamp will
 * change any time a variable in the collection is changed.
 */
export const getPublishedVariables = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/variables/published`, [method("GET")]];
};

export const PostVariablesBodySchema = z.object({
  variableCollections: z.string().array().optional(), // VariableCollectionChange[]
  variableModes: z.string().array().optional(), // 	VariableModeChange[]
  variables: z.string().array().optional(), // 	VariableChange[]
  variableModeValues: z.string().array().optional(), // VariableModeValue[]
});

export type PostVariables = z.infer<typeof PostVariablesBodySchema>;

/**
 * 
 */
export const postVariables = (
  key: string,
  options?: PostVariables
): TEndpointDec => {
  const transformers = [method("POST")];
  if (options) {
    transformers.push(body(JSON.stringify(options)));
  }
  return [`/v1/files/${key}/variables`, transformers];
};
