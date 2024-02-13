import type { TEndpointDec } from "@zemd/http-client";

/**
 * A list of the versions of a file.
 */
export const getFileVersion = (key: string): TEndpointDec => {
  return [`/v1/files/${key}/versions`, []];
};
