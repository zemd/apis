import { header, type TFetchTransformer } from "@zemd/http-client";

export const figmaToken = (value: string): TFetchTransformer => {
  return header("X-Figma-Token", value);
};
