import { z } from "zod";

export const IDS = z
  .string()
  .or(z.string().array())
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.join(",");
    }
    return value;
  })
  .pipe(z.string().or(z.string().array()));
