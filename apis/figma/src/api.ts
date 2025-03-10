import { createEndpoint, query, body, method, prefix, json } from "@zemd/http-client";
import type { TFetchTransformer } from "@zemd/http-client";
import type {
  GetFileResponse,
  GetFilePathParams,
  GetFileQueryParams,
  GetFileNodesResponse,
  GetFileNodesPathParams,
  GetFileNodesQueryParams,
  GetImagesResponse,
  GetImagesPathParams,
  GetImagesQueryParams,
  GetImageFillsResponse,
  GetImageFillsPathParams,
  GetTeamProjectsResponse,
  GetTeamProjectsPathParams,
  GetProjectFilesResponse,
  GetProjectFilesPathParams,
  GetProjectFilesQueryParams,
  GetFileVersionsResponse,
  GetFileVersionsPathParams,
  GetFileVersionsQueryParams,
  GetCommentsResponse,
  GetCommentsPathParams,
  GetCommentsQueryParams,
  PostCommentResponse,
  PostCommentPathParams,
  PostCommentRequestBody,
  DeleteCommentResponse,
  DeleteCommentPathParams,
  GetCommentReactionsResponse,
  GetCommentReactionsPathParams,
  GetCommentReactionsQueryParams,
  PostCommentReactionResponse,
  PostCommentReactionPathParams,
  PostCommentReactionRequestBody,
  DeleteCommentReactionResponse,
  DeleteCommentReactionPathParams,
  DeleteCommentReactionQueryParams,
  GetMeResponse,
  GetTeamComponentsResponse,
  GetTeamComponentsPathParams,
  GetTeamComponentsQueryParams,
  GetFileComponentsResponse,
  GetFileComponentsPathParams,
  GetComponentResponse,
  GetComponentPathParams,
  GetTeamComponentSetsResponse,
  GetTeamComponentSetsPathParams,
  GetTeamComponentSetsQueryParams,
  GetFileComponentSetsResponse,
  GetFileComponentSetsPathParams,
  GetComponentSetResponse,
  GetComponentSetPathParams,
  GetTeamStylesResponse,
  GetTeamStylesPathParams,
  GetTeamStylesQueryParams,
  GetFileStylesResponse,
  GetFileStylesPathParams,
  GetStyleResponse,
  GetStylePathParams,
  PostWebhookResponse,
  PostWebhookRequestBody,
  GetWebhookResponse,
  GetWebhookPathParams,
  PutWebhookResponse,
  PutWebhookPathParams,
  PutWebhookRequestBody,
  DeleteWebhookResponse,
  DeleteWebhookPathParams,
  GetTeamWebhooksResponse,
  GetTeamWebhooksPathParams,
  GetWebhookRequestsResponse,
  GetWebhookRequestsPathParams,
  GetActivityLogsResponse,
  GetActivityLogsQueryParams,
  GetPaymentsResponse,
  GetPaymentsQueryParams,
  GetLocalVariablesResponse,
  GetLocalVariablesPathParams,
  GetPublishedVariablesResponse,
  GetPublishedVariablesPathParams,
  PostVariablesResponse,
  PostVariablesPathParams,
  PostVariablesRequestBody,
  GetDevResourcesResponse,
  GetDevResourcesPathParams,
  GetDevResourcesQueryParams,
  PostDevResourcesResponse,
  PostDevResourcesRequestBody,
  PutDevResourcesResponse,
  PutDevResourcesRequestBody,
  DeleteDevResourceResponse,
  DeleteDevResourcePathParams,
  GetLibraryAnalyticsComponentActionsResponse,
  GetLibraryAnalyticsComponentActionsPathParams,
  GetLibraryAnalyticsComponentActionsQueryParams,
  GetLibraryAnalyticsComponentUsagesResponse,
  GetLibraryAnalyticsComponentUsagesPathParams,
  GetLibraryAnalyticsComponentUsagesQueryParams,
  GetLibraryAnalyticsStyleActionsResponse,
  GetLibraryAnalyticsStyleActionsPathParams,
  GetLibraryAnalyticsStyleActionsQueryParams,
  GetLibraryAnalyticsStyleUsagesResponse,
  GetLibraryAnalyticsStyleUsagesPathParams,
  GetLibraryAnalyticsStyleUsagesQueryParams,
  GetLibraryAnalyticsVariableActionsResponse,
  GetLibraryAnalyticsVariableActionsPathParams,
  GetLibraryAnalyticsVariableActionsQueryParams,
  GetLibraryAnalyticsVariableUsagesResponse,
  GetLibraryAnalyticsVariableUsagesPathParams,
  GetLibraryAnalyticsVariableUsagesQueryParams,
} from "@figma/rest-api-spec";

export const figma = (initialTransformers: TFetchTransformer[]) => {
  const endpoint = createEndpoint([prefix("https://api.figma.com"), json(), ...initialTransformers]);
  return {
    v1: {
      files: {
        getFile: async (fileKey: GetFilePathParams["file_key"], options?: GetFileQueryParams) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetFileResponse>(`/v1/files/${fileKey}`, transformers);
        },
        getFileNodes: async (fileKey: GetFileNodesPathParams["file_key"], options: GetFileNodesQueryParams) => {
          return endpoint<GetFileNodesResponse>(`/v1/files/${fileKey}/nodes`, [method("GET"), query(options)]);
        },
        getImageFills: async (fileKey: GetImageFillsPathParams["file_key"]) => {
          return endpoint<GetImageFillsResponse>(`/v1/files/${fileKey}/images`, [method("GET")]);
        },
        getFileVersions: async (
          fileKey: GetFileVersionsPathParams["file_key"],
          options?: GetFileVersionsQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetFileVersionsResponse>(`/v1/files/${fileKey}/versions`, transformers);
        },
        getComments: async (fileKey: GetCommentsPathParams["file_key"], options?: GetCommentsQueryParams) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetCommentsResponse>(`/v1/files/${fileKey}/comments`, transformers);
        },
        postComment: async (fileKey: PostCommentPathParams["file_key"], obj: PostCommentRequestBody) => {
          return endpoint<PostCommentResponse>(`/v1/files/${fileKey}/comments`, [
            method("POST"),
            body(JSON.stringify(obj)),
          ]);
        },
        deleteComment: async (
          fileKey: DeleteCommentPathParams["file_key"],
          commentId: DeleteCommentPathParams["comment_id"],
        ) => {
          return endpoint<DeleteCommentResponse>(`/v1/files/${fileKey}/comments/${commentId}`, [method("DELETE")]);
        },
        getCommentReactions: async (
          fileKey: GetCommentReactionsPathParams["file_key"],
          commentId: GetCommentReactionsPathParams["comment_id"],
          options?: GetCommentReactionsQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetCommentReactionsResponse>(
            `/v1/files/${fileKey}/comments/${commentId}/reactions`,
            transformers,
          );
        },
        postCommentReaction: async (
          fileKey: PostCommentReactionPathParams["file_key"],
          commentId: PostCommentReactionPathParams["comment_id"],
          obj: PostCommentReactionRequestBody,
        ) => {
          return endpoint<PostCommentReactionResponse>(`/v1/files/${fileKey}/comments/${commentId}/reactions`, [
            method("POST"),
            body(JSON.stringify(obj)),
          ]);
        },
        deleteCommentReaction: async (
          fileKey: DeleteCommentReactionPathParams["file_key"],
          commentId: DeleteCommentReactionPathParams["comment_id"],
          options: DeleteCommentReactionQueryParams,
        ) => {
          return endpoint<DeleteCommentReactionResponse>(`/v1/files/${fileKey}/comments/${commentId}/reactions`, [
            method("DELETE"),
            query(options),
          ]);
        },
        getFileComponents: async (fileKey: GetFileComponentsPathParams["file_key"]) => {
          return endpoint<GetFileComponentsResponse>(`/v1/files/${fileKey}/components`, [method("GET")]);
        },
        getFileComponentSets: async (fileKey: GetFileComponentSetsPathParams["file_key"]) => {
          return endpoint<GetFileComponentSetsResponse>(`/v1/files/${fileKey}/component_sets`, [method("GET")]);
        },
        getFileStyles: async (fileKey: GetFileStylesPathParams["file_key"]) => {
          return endpoint<GetFileStylesResponse>(`/v1/files/${fileKey}/styles`, [method("GET")]);
        },
        getLocalVariables: async (fileKey: GetLocalVariablesPathParams["file_key"]) => {
          return endpoint<GetLocalVariablesResponse>(`/v1/files/${fileKey}/variables/local`, [method("GET")]);
        },
        getPublishedVariables: async (fileKey: GetPublishedVariablesPathParams["file_key"]) => {
          return endpoint<GetPublishedVariablesResponse>(`/v1/files/${fileKey}/variables/published`, [method("GET")]);
        },
        postVariables: async (fileKey: PostVariablesPathParams["file_key"], obj: PostVariablesRequestBody) => {
          return endpoint<PostVariablesResponse>(`/v1/files/${fileKey}/variables`, [
            method("POST"),
            body(JSON.stringify(obj)),
          ]);
        },
        getDevResources: async (
          fileKey: GetDevResourcesPathParams["file_key"],
          options?: GetDevResourcesQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetDevResourcesResponse>(`/v1/files/${fileKey}/dev_resources`, transformers);
        },
        deleteDevResource: async (
          fileKey: DeleteDevResourcePathParams["file_key"],
          devResourceId: DeleteDevResourcePathParams["dev_resource_id"],
        ) => {
          return endpoint<DeleteDevResourceResponse>(`/v1/files/${fileKey}/dev_resources/${devResourceId}`, [
            method("DELETE"),
          ]);
        },
      },
      images: {
        getImages: async (fileKey: GetImagesPathParams["file_key"], options: GetImagesQueryParams) => {
          return endpoint<GetImagesResponse>(`/v1/images/${fileKey}`, [method("GET"), query(options)]);
        },
      },
      teams: {
        getTeamProjects: async (teamId: GetTeamProjectsPathParams["team_id"]) => {
          return endpoint<GetTeamProjectsResponse>(`/v1/teams/${teamId}/projects`, [method("GET")]);
        },
        getTeamComponents: async (
          teamId: GetTeamComponentsPathParams["team_id"],
          options?: GetTeamComponentsQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetTeamComponentsResponse>(`/v1/teams/${teamId}/components`, transformers);
        },
        getTeamComponentSets: async (
          teamId: GetTeamComponentSetsPathParams["team_id"],
          options?: GetTeamComponentSetsQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetTeamComponentSetsResponse>(`/v1/teams/${teamId}/component_sets`, transformers);
        },
        getTeamStyles: async (teamId: GetTeamStylesPathParams["team_id"], options?: GetTeamStylesQueryParams) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetTeamStylesResponse>(`/v1/teams/${teamId}/styles`, transformers);
        },
      },
      projects: {
        getProjectFiles: async (
          projectId: GetProjectFilesPathParams["project_id"],
          options?: GetProjectFilesQueryParams,
        ) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetProjectFilesResponse>(`/v1/projects/${projectId}/files`, transformers);
        },
      },
      me: {
        getMe: async () => {
          return endpoint<GetMeResponse>(`/v1/me`, [method("GET")]);
        },
      },
      components: {
        getComponent: async (key: GetComponentPathParams["key"]) => {
          return endpoint<GetComponentResponse>(`/v1/components/${key}`, [method("GET")]);
        },
      },
      component_sets: {
        getComponentSet: async (key: GetComponentSetPathParams["key"]) => {
          return endpoint<GetComponentSetResponse>(`/v1/component_sets/${key}`, [method("GET")]);
        },
      },
      styles: {
        getStyle: async (key: GetStylePathParams["key"]) => {
          return endpoint<GetStyleResponse>(`/v1/styles/${key}`, [method("GET")]);
        },
      },
      activity_logs: {
        getActivityLogs: async (options?: GetActivityLogsQueryParams) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetActivityLogsResponse>(`/v1/activity_logs`, transformers);
        },
      },
      payments: {
        getPayments: async (options?: GetPaymentsQueryParams) => {
          const transformers = [method("GET")];
          if (options) {
            transformers.push(query(options));
          }
          return endpoint<GetPaymentsResponse>(`/v1/payments`, transformers);
        },
      },
      dev_resources: {
        postDevResources: async (obj: PostDevResourcesRequestBody) => {
          return endpoint<PostDevResourcesResponse>(`/v1/dev_resources`, [method("POST"), body(JSON.stringify(obj))]);
        },
        putDevResources: async (obj: PutDevResourcesRequestBody) => {
          return endpoint<PutDevResourcesResponse>(`/v1/dev_resources`, [method("PUT"), body(JSON.stringify(obj))]);
        },
      },
      analytics: {
        getLibraryAnalyticsComponentActions: async (
          fileKey: GetLibraryAnalyticsComponentActionsPathParams["file_key"],
          options: GetLibraryAnalyticsComponentActionsQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsComponentActionsResponse>(
            `/v1/analytics/libraries/${fileKey}/component/actions`,
            [method("GET"), query(options)],
          );
        },
        getLibraryAnalyticsComponentUsages: async (
          fileKey: GetLibraryAnalyticsComponentUsagesPathParams["file_key"],
          options: GetLibraryAnalyticsComponentUsagesQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsComponentUsagesResponse>(
            `/v1/analytics/libraries/${fileKey}/component/usages`,
            [method("GET"), query(options)],
          );
        },
        getLibraryAnalyticsStyleActions: async (
          fileKey: GetLibraryAnalyticsStyleActionsPathParams["file_key"],
          options: GetLibraryAnalyticsStyleActionsQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsStyleActionsResponse>(`/v1/analytics/libraries/${fileKey}/style/actions`, [
            method("GET"),
            query(options),
          ]);
        },
        getLibraryAnalyticsStyleUsages: async (
          fileKey: GetLibraryAnalyticsStyleUsagesPathParams["file_key"],
          options: GetLibraryAnalyticsStyleUsagesQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsStyleUsagesResponse>(`/v1/analytics/libraries/${fileKey}/style/usages`, [
            method("GET"),
            query(options),
          ]);
        },
        getLibraryAnalyticsVariableActions: async (
          fileKey: GetLibraryAnalyticsVariableActionsPathParams["file_key"],
          options: GetLibraryAnalyticsVariableActionsQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsVariableActionsResponse>(
            `/v1/analytics/libraries/${fileKey}/variable/actions`,
            [method("GET"), query(options)],
          );
        },
        getLibraryAnalyticsVariableUsages: async (
          fileKey: GetLibraryAnalyticsVariableUsagesPathParams["file_key"],
          options: GetLibraryAnalyticsVariableUsagesQueryParams,
        ) => {
          return endpoint<GetLibraryAnalyticsVariableUsagesResponse>(
            `/v1/analytics/libraries/${fileKey}/variable/usages`,
            [method("GET"), query(options)],
          );
        },
      },
    },
    v2: {
      webhooks: {
        postWebhook: async (obj: PostWebhookRequestBody) => {
          return endpoint<PostWebhookResponse>(`/v2/webhooks`, [method("POST"), body(JSON.stringify(obj))]);
        },
        getWebhook: async (webhookId: GetWebhookPathParams["webhook_id"]) => {
          return endpoint<GetWebhookResponse>(`/v2/webhooks/${webhookId}`, [method("GET")]);
        },
        putWebhook: async (webhookId: PutWebhookPathParams["webhook_id"], obj: PutWebhookRequestBody) => {
          return endpoint<PutWebhookResponse>(`/v2/webhooks/${webhookId}`, [method("PUT"), body(JSON.stringify(obj))]);
        },
        deleteWebhook: async (webhookId: DeleteWebhookPathParams["webhook_id"]) => {
          return endpoint<DeleteWebhookResponse>(`/v2/webhooks/${webhookId}`, [method("DELETE")]);
        },
        getWebhookRequests: async (webhookId: GetWebhookRequestsPathParams["webhook_id"]) => {
          return endpoint<GetWebhookRequestsResponse>(`/v2/webhooks/${webhookId}/requests`, [method("GET")]);
        },
      },
      teams: {
        getTeamWebhooks: async (teamId: GetTeamWebhooksPathParams["team_id"]) => {
          return endpoint<GetTeamWebhooksResponse>(`/v2/teams/${teamId}/webhooks`, [method("GET")]);
        },
      },
    },
  };
};
