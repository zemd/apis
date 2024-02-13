import { z } from "zod";
import { method, query, type TEndpointDec } from "@zemd/http-client";

export const GetActivityLogsQuerySchema = z.object({
  events: z.string().optional(),
  start_time: z.number().optional(),
  end_time: z.number().optional(),
  limit: z.number().optional(),
  order: z.string().optional(),
});

export type GetActivityLogs = z.infer<typeof GetActivityLogsQuerySchema>;

/**
 * Returns a list of activity log events
 */
export const getActivityLogs = (options?: GetActivityLogs): TEndpointDec => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(query(options));
  }
  return [`/v1/activity_logs`, transformers];
};
