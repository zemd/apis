import { method, query, type TEndpointDecTuple } from "@zemd/http-client";
import { z } from "zod";

export const GetFileQuerySchema = z.object({
  version: z.string().optional(),
  ids: z.string().optional(),
  depth: z.number().optional(),
  geometry: z.string().optional(),
  plugin_data: z.string().optional(),
  branch_data: z.boolean().optional(),
});

export interface GetFileQuery extends z.infer<typeof GetFileQuerySchema> {}

/**
 * Returns the document referred to by :key as a JSON object. The file key
 * can be parsed from any Figma file url:
 * https://www.figma.com/file/:key/:title.
 * The name, lastModified, thumbnailUrl, editorType, linkAccess, and version
 * attributes are all metadata of the retrieved file. The document attribute
 * contains a Node of type DOCUMENT.
 *
 * The components key contains a mapping from node IDs to component metadata.
 * This is to help you determine which components each instance comes from.
 */
export const getFile = (key: string, options?: GetFileQuery): TEndpointDecTuple => {
  const transformers = [method("GET")];

  if (options) {
    transformers.push(query(GetFileQuerySchema.passthrough().parse(options)));
  }

  return [`/files/${key}`, transformers];
};

export const GetFileNodesQuerySchema = z.object({
  ids: z.string(),
  version: z.string().optional(),
  depth: z.number().optional(),
  geometry: z.string().optional(),
  plugin_data: z.string().optional(),
});

export interface GetFileNodesQuery extends z.infer<typeof GetFileNodesQuerySchema> {}

/**
 * Returns the nodes referenced to by `:ids` as a JSON object. The nodes are
 * retrieved from the Figma file referenced to by `:key`.
 *
 * The node id and file key can be parsed from any Figma node url:
 * https://www.figma.com/file/:key/:title?node-id=:id.
 *
 * The name, lastModified, thumbnailUrl, editorType, and version attributes
 * are all metadata of the specified file.
 *
 * The document attribute contains a Node of type DOCUMENT.
 *
 * The components key contains a mapping from node IDs to component metadata.
 * This is to help you determine which components each instance comes from.
 *
 * By default, no vector data is returned. To return vector data, pass the
 * geometry=paths parameter to the endpoint.
 * Each node can also inherit properties from applicable styles. The styles
 * key contains a mapping from style IDs to style metadata.
 *
 * Important: the nodes map may contain values that are null . This may be due
 * to the node id not existing within the specified file.
 */
export const getFileNodes = (key: string, options: GetFileNodesQuery): TEndpointDecTuple => {
  return [`/files/${key}/nodes`, [method("GET"), query(GetFileNodesQuerySchema.passthrough().parse(options))]];
};

export const GetImageQuerySchema = z.object({
  ids: z.string(),
  scale: z.number().optional(),
  format: z.enum(["jpg", "png", "svg", "pdf"]).optional(),
  svg_outline_text: z.boolean().optional(),
  svg_include_id: z.boolean().optional(),
  svg_include_node_id: z.boolean().optional(),
  svg_simplify_stroke: z.boolean().optional(),
  contents_only: z.boolean().optional(),
  use_absolute_bounds: z.boolean().optional(),
  version: z.string().optional(),
});

export interface GetImageQuery extends z.infer<typeof GetImageQuerySchema> {}

/**
 * Renders images from a file.
 *
 * If no error occurs, "images" will be populated with a map from node IDs to
 * URLs of the rendered images, and "status" will be omitted. The image assets
 * will expire after 30 days. Images up to 32 megapixels can be exported. Any
 * images that are larger will be scaled down.
 *
 * Important: the image map may contain values that are null. This indicates
 * that rendering of that specific node has failed. This may be due to the node
 * id not existing, or other reasons such has the node having no renderable
 * components. For example, a node that is invisible or has 0% opacity cannot
 * be rendered. It is guaranteed that any node that was requested for rendering
 * will be represented in this map whether or not the render succeeded.
 *
 * To render multiple images from the same file, use the ids query parameter
 * to specify multiple node ids.
 */
export const getImage = (key: string, options: GetImageQuery): TEndpointDecTuple => {
  return [`/images/${key}`, [method("GET"), query(GetImageQuerySchema.passthrough().parse(options))]];
};

/**
 * Returns download links for all images present in image fills in a document.
 * Image fills are how Figma represents any user supplied images. When you drag
 * an image into Figma, we create a rectangle with a single fill that represents
 * the image, and the user is able to transform the rectangle (and properties on
 * the fill) as they wish.
 *
 * This endpoint returns a mapping from image references to the URLs at which the
 * images may be download. Image URLs will expire after no more than 14 days. Image
 * references are located in the output of the GET files endpoint under the imageRef
 * attribute in a Paint.
 */
export const getImageFills = (key: string): TEndpointDecTuple => {
  return [`/files/${key}/images`, [method("GET")]];
};
