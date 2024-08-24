/**
 * A list of the versions of a file.
 */
export const getFileVersion = (key: string) => {
  return { url: `/v1/files/${key}/versions`, transformers: [] };
};
