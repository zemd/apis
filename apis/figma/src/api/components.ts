import { z } from "zod";
import { method, query, type TEndpointDec } from "@zemd/http-client";

export const GetTeamComponentsQuerySchema = z.object({
  page_size: z.number().optional(),
  after: z.number().optional(),
  before: z.number().optional(),
});

export type GetTeamComponents = z.infer<typeof GetTeamComponentsQuerySchema>;

/**
 * Get a paginated list of published components within a team library
 */
export const getTeamComponents = (
  teamId: string,
  options: GetTeamComponents
): TEndpointDec => {
  return [`/v1/teams/${teamId}/components`, [method("GET"), query(options)]];
};

/**
 * Get a list of published components within a file library
 */
export const getFileComponents = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/components`, [method("GET")]];
};

/**
 * Get metadata on a component by key.
 */
export const getComponent = (key: string): TEndpointDec => {
  return [`/v1/components/${key}`, [method("GET")]];
};

/**
 * Get a paginated list of published component sets within a team library
 */
export const getTeamComponentSets = (
  teamId: string,
  options: GetTeamComponents
): TEndpointDec => {
  return [
    `/v1/teams/${teamId}/component_sets`,
    [method("GET"), query(options)],
  ];
};

/**
 * Get a list of published component sets within a file library
 */
export const getFileComponentSets = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/component_sets`, [method("GET")]];
};

/**
 * Get metadata on a component set by key.
 */
export const getComponentSet = (key: string): TEndpointDec => {
  return [`/v1/component_sets/${key}`, [method("GET")]];
};

/**
 * Get a paginated list of published styles within a team library
 */
export const getTeamStyles = (
  teamId: string,
  options: GetTeamComponents
): TEndpointDec => {
  return [`/v1/teams/${teamId}/styles`, [method("GET"), query(options)]];
};

/**
 * Get a list of published styles within a file library
 */
export const getFileStyles = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/styles`, [method("GET")]];
};

/**
 * Get metadata on a style by key.
 */
export const getStyle = (key: string): TEndpointDec => {
  return [`/v1/styles/${key}`, [method("GET")]];
};

