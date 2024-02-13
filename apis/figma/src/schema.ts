import { z } from "zod";

export const ColorProp = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1),
});

export const VariableAliasProp = z.object({
  type: z.literal("VARIABLE_ALIAS"),
  id: z.string(),
});
