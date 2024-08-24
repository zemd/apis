import { method } from "@zemd/http-client";

/**
 * If you are using OAuth for authentication, this endpoint can be
 * used to get user information for the authenticated user.
 */
export const getMe = () => {
  return { url: `/v1/me`, transformers: [method("GET")] };
};
