import { z } from "zod";
import { method, query, type TEndpointDec } from "@zemd/http-client";

export const GetPaymentsQuerySchema = z.object({
  user_id: z.number(),
  community_file_id: z.number(),
  plugin_id: z.number(),
  widget_id: z.number(),
});

export type GetPayments = z.infer<typeof GetPaymentsQuerySchema>;

/**
 * Fetch the payment information of a user on your resource using IDs.
 */
export const getPayments = (options: GetPayments): TEndpointDec => {
  return [`/v1/payments`, [method("GET"), query(options)]];
};
