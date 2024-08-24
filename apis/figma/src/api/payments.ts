import { z } from "zod";
import { method, query } from "@zemd/http-client";

export const GetPaymentsQuerySchema = z.object({
  user_id: z.number(),
  community_file_id: z.number(),
  plugin_id: z.number(),
  widget_id: z.number(),
});

export interface GetPaymentsQuery
  extends z.infer<typeof GetPaymentsQuerySchema> {}

/**
 * Fetch the payment information of a user on your resource using IDs.
 */
export const getPayments = (options: GetPaymentsQuery) => {
  return {
    url: `/v1/payments`,
    transformers: [
      method("GET"),
      query(GetPaymentsQuerySchema.passthrough().parse(options)),
    ],
  };
};
