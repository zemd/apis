import type { TEndpointDecTuple } from "@zemd/http-client";

/**
 * A list of the versions of a file.
 */
export const getFileVersion = (key: string): TEndpointDecTuple => {
  return [`/v1/files/${key}/versions`, []];
};
