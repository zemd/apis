import { z } from "zod";
import { method, query } from "@zemd/http-client";

/**
 * You can use this Endpoint to get a list of all the Projects within
 * the specified team. This will only return projects visible to the
 * authenticated user or owner of the developer token. Note: it is not
 * currently possible to programmatically obtain the team id of a user
 * just from a token. To obtain a team id, navigate to a team page of a
 * team you are a part of. The team id will be present in the URL after
 * the word team and before your team name.
 */
export const getTeamProjects = (teamId: string) => {
  return { url: `/v1/teams/${teamId}/projects`, transformers: [method("GET")] };
};

const GetProjectFilesQuerySchema = z.object({
  branch_data: z.string().optional(),
});

export interface GetProjectFilesQuery
  extends z.infer<typeof GetProjectFilesQuerySchema> {}

/**
 * List the files in a given project.
 */
export const getProjectFiles = (
  projectId: string,
  options?: GetProjectFilesQuery,
) => {
  const transformers = [method("GET")];
  if (options) {
    transformers.push(
      query(GetProjectFilesQuerySchema.passthrough().parse(options)),
    );
  }
  return { url: `/v1/projects/${projectId}/files`, transformers };
};
