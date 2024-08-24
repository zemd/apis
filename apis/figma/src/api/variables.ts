import { z } from "zod";
import { body, method } from "@zemd/http-client";
import { ColorProp, VariableAliasProp } from "../schema.js";

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
export const getLocalVariables = (key: string) => {
  return {
    url: `/v1/files/${key}/variables/local`,
    transformers: [method("GET")],
  };
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
export const getPublishedVariables = (key: string) => {
  return {
    url: `/v1/files/${key}/variables/published`,
    transformers: [method("GET")],
  };
};

const VariableCollectionChange = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CREATE"),
    id: z.string().optional(),
    name: z.string(),
    initialModeId: z.string().optional(),
    hiddenFromPublishing: z.boolean().default(false).optional(),
  }),
  z.object({
    action: z.literal("UPDATE"),
    id: z.string(),
    name: z.string().optional(),
    initialModeId: z.string(),
    hiddenFromPublishing: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("DELETE"),
    id: z.string(),
    name: z.string().optional(),
    initialModeId: z.string(),
    hiddenFromPublishing: z.boolean().optional(),
  }),
]);

const VariableModeChange = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CREATE"),
    id: z.string().optional(),
    name: z.string(),
    variableCollectionId: z.string(),
  }),
  z.object({
    action: z.literal("UPDATE"),
    id: z.string(),
    name: z.string().optional(),
    variableCollectionId: z.string(),
  }),
  z.object({
    action: z.literal("DELETE"),
    id: z.string(),
    name: z.string().optional(),
    variableCollectionId: z.string(),
  }),
]);

const VariableScope = z.enum([
  "ALL_SCOPES",
  "ALL_FILLS",
  "TEXT_CONTENT",
  "WIDTH_HEIGHT",
  "GAP",
  "STROKE_FLOAT",
  "OPACITY",
  "EFFECT_FLOAT",
  "FRAME_FILL",
  "SHAPE_FILL",
  "TEXT_FILL",
  "STROKE_COLOR",
  "EFFECT_COLOR",
]);

const VariableCodeSyntax = z.object({
  WEB: z.string(),
  ANDROID: z.string(),
  iOS: z.string(),
});

const VariableChange = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CREATE"),
    id: z.string().optional(),
    name: z.string(),
    variableCollectionId: z.string(),
    resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]),
    description: z.string().optional(),
    hiddenFromPublishing: z.boolean().default(false).optional(),
    scopes: z.array(VariableScope),
    codeSyntax: VariableCodeSyntax,
  }),
  z.object({
    action: z.literal("UPDATE"),
    id: z.string(),
    name: z.string().optional(),
    variableCollectionId: z.string().optional(),
    resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]).optional(),
    description: z.string().optional(),
    hiddenFromPublishing: z.boolean().optional(),
    scopes: z.array(VariableScope),
    codeSyntax: VariableCodeSyntax,
  }),
  z.object({
    action: z.literal("DELETE"),
    id: z.string(),
    name: z.string().optional(),
    variableCollectionId: z.string().optional(),
    resolvedType: z.enum(["BOOLEAN", "FLOAT", "STRING", "COLOR"]).optional(),
    description: z.string().optional(),
    hiddenFromPublishing: z.boolean().optional(),
    scopes: z.array(VariableScope),
    codeSyntax: VariableCodeSyntax,
  }),
]);

const VariableModeValue = z.object({
  variableId: z.string(),
  modeId: z.string(),
  value: z
    .string()
    .or(z.number())
    .or(z.boolean())
    .or(ColorProp)
    .or(VariableAliasProp),
});

export const PostVariablesBodySchema = z.object({
  variableCollections: z.array(VariableCollectionChange).optional(),
  variableModes: z.array(VariableModeChange).optional(),
  variables: z.array(VariableChange).optional(),
  variableModeValues: z.array(VariableModeValue).optional(),
});

export interface PostVariablesBody
  extends z.infer<typeof PostVariablesBodySchema> {}

/**
 *
 */
export const postVariables = (key: string, options?: PostVariablesBody) => {
  const transformers = [method("POST")];
  if (options) {
    transformers.push(
      body(
        JSON.stringify(PostVariablesBodySchema.passthrough().parse(options)),
      ),
    );
  }
  return { url: `/v1/files/${key}/variables`, transformers };
};
