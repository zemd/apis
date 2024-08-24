import { z } from "zod";
import { method, query } from "@zemd/http-client";

export const PaginationQuerySchema = z.object({
  page_size: z.number().optional(),
  after: z.number().optional(),
  before: z.number().optional(),
});

export interface GetTeamComponentsQuery
  extends z.infer<typeof PaginationQuerySchema> {}

/**
 * Get a paginated list of published components within a team library
 */
export const getTeamComponents = (
  teamId: string,
  options: GetTeamComponentsQuery,
) => {
  return {
    url: `/v1/teams/${teamId}/components`,
    transformers: [
      method("GET"),
      query(PaginationQuerySchema.passthrough().parse(options)),
    ],
  };
};

/**
 * Get a list of published components within a file library
 */
export const getFileComponents = (key: string) => {
  return {
    url: `/v1/files/${key}/components`,
    transformers: [method("GET")],
  };
};

/**
 * Get metadata on a component by key.
 */
export const getComponent = (key: string) => {
  return {
    url: `/v1/components/${key}`,
    transformers: [method("GET")],
  };
};

export interface GetTeamComponentSetsQuery
  extends z.infer<typeof PaginationQuerySchema> {}
/**
 * Get a paginated list of published component sets within a team library
 */
export const getTeamComponentSets = (
  teamId: string,
  options: GetTeamComponentSetsQuery,
) => {
  return {
    url: `/v1/teams/${teamId}/component_sets`,
    transformers: [
      method("GET"),
      query(PaginationQuerySchema.passthrough().parse(options)),
    ],
  };
};

/**
 * Get a list of published component sets within a file library
 */
export const getFileComponentSets = (key: string) => {
  return {
    url: `/v1/files/${key}/component_sets`,
    transformers: [method("GET")],
  };
};

/**
 * Get metadata on a component set by key.
 */
export const getComponentSet = (key: string) => {
  return {
    url: `/v1/component_sets/${key}`,
    transformers: [method("GET")],
  };
};

export interface GetTeamStylesQuery
  extends z.infer<typeof PaginationQuerySchema> {}

/**
 * Get a paginated list of published styles within a team library
 */
export const getTeamStyles = (teamId: string, options: GetTeamStylesQuery) => {
  return {
    url: `/v1/teams/${teamId}/styles`,
    transformers: [
      method("GET"),
      query(PaginationQuerySchema.passthrough().parse(options)),
    ],
  };
};

/**
 * Get a list of published styles within a file library
 */
export const getFileStyles = (key: string) => {
  return {
    url: `/v1/files/${key}/styles`,
    transformers: [method("GET")],
  };
};

/**
 * Get metadata on a style by key.
 */
export const getStyle = (key: string) => {
  return {
    url: `/v1/styles/${key}`,
    transformers: [method("GET")],
  };
};
