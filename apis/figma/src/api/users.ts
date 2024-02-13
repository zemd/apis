import { method, type TEndpointDec } from "@zemd/http-client";

/**
 * If you are using OAuth for authentication, this endpoint can be
 * used to get user information for the authenticated user.
 */
export const getMe = (): TEndpointDec => {
  return [`/v1/me`, [method("GET")]];
};
