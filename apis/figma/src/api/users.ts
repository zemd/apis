import { method, type TEndpointDecTuple } from "@zemd/http-client";

/**
 * If you are using OAuth for authentication, this endpoint can be
 * used to get user information for the authenticated user.
 */
export const getMe = (): TEndpointDecTuple => {
  return [`/v1/me`, [method("GET")]];
};
