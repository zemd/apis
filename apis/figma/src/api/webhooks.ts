import { z } from "zod";
import { body, method, type TEndpointDecTuple } from "@zemd/http-client";

const WebhookV2Event = z.enum([
  "FILE_UPDATE",
  "FILE_DELETE",
  "FILE_VERSION_UPDATE",
  "LIBRARY_PUBLISH",
  "FILE_COMMENT",
  "FILE_DELETE",
]);
const WebhookV2Status = z.enum(["ACTIVE", "PAUSED"]);

export const PostWebhooksBodySchema = z.object({
  event_type: WebhookV2Event,
  team_id: z.string(),
  endpoint: z.string(),
  passcode: z.string(),
  status: WebhookV2Status.optional(),
  description: z.string().optional(),
});

export interface PostWebhooksBody
  extends z.infer<typeof PostWebhooksBodySchema> {}

/**
 * Create a new webhook which will call the specified endpoint when
 * the event triggers. By default, this webhook will automatically
 * send a PING event to the endpoint when it is created. If this
 * behavior is not desired, you can create the webhook and set the
 * status to PAUSED and reactivate it later.
 */
export const postWebhooks = (obj: PostWebhooksBody): TEndpointDecTuple => {
  return [
    `/v2/webhooks`,
    [
      method("POST"),
      body(JSON.stringify(PostWebhooksBodySchema.passthrough().parse(obj))),
    ],
  ];
};

/**
 * Returns the WebhookV2 corresponding to the ID provided, if it exists.
 */
export const getWebhooks = (webhookId: string): TEndpointDecTuple => {
  return [`/v2/webhooks/${webhookId}`, [method("GET")]];
};

export const PutWebhooksBodySchema = z.object({
  event_type: WebhookV2Event.optional(),
  endpoint: z.string().optional(),
  passcode: z.string().optional(),
  status: WebhookV2Status.optional(),
  description: z.string().optional(),
});

export interface PutWebhooksBody
  extends z.infer<typeof PutWebhooksBodySchema> {}

/**
 * Updates the webhook with the specified properties.
 */
export const putWebhooks = (
  webhookId: string,
  obj?: PutWebhooksBody,
): TEndpointDecTuple => {
  const transformers = [method("PUT")];
  if (obj) {
    transformers.push(
      body(JSON.stringify(PutWebhooksBodySchema.passthrough().parse(obj))),
    );
  }
  return [`/v2/webhooks/${webhookId}`, transformers];
};

/**
 * Deletes the specified webhook. This operation cannot be reversed.
 */
export const deleteWebhooks = (webhookId: string): TEndpointDecTuple => {
  return [`/v2/webhooks/${webhookId}`, [method("DELETE")]];
};

/**
 * Returns all webhooks registered under the specified team.
 */
export const getTeamWebhooks = (teamId: string): TEndpointDecTuple => {
  return [`/v2/teams/${teamId}/webhooks`, [method("GET")]];
};

/**
 * Returns all webhook requests sent within the last week. Useful for debugging.
 */
export const getWebhooksRequests = (webhookId: string): TEndpointDecTuple => {
  return [`/v2/webhooks/${webhookId}/requests`, [method("GET")]];
};
