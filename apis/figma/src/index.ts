import * as files from "./api/files.js";
import * as comments from "./api/comments.js";
import * as users from "./api/users.js";
import * as versions from "./api/versions.js";
import * as projects from "./api/projects.js";
import * as components from "./api/components.js";
import * as webhooks from "./api/webhooks.js";
import * as logs from "./api/logs.js";
import * as payments from "./api/payments.js";
import * as variables from "./api/variables.js";
import * as devResources from "./api/dev_resources.js";
import {
  debug,
  endpoint,
  header,
  json,
  prefix,
  type TEndpointDec,
  type TEndpointDeclarationFn,
  type TEndpointResFn,
  type TTransformer,
} from "@zemd/http-client";

const FIGMA_URL = process.env["FIGMA_URL"] || "https://api.figma.com/v1";

export const figmaToken = (value: string): TTransformer => {
  return header("X-Figma-Token", value);
};

export const figma = (accessToken: string, opts?: { debug?: boolean }) => {
  const build = <ArgFn extends TEndpointDeclarationFn, ArgFnParams extends Parameters<ArgFn>>(
    fn: ArgFn,
  ): TEndpointResFn<ArgFnParams> => {
    const globalTransformers: Array<TTransformer> = [prefix(FIGMA_URL), json(), figmaToken(accessToken)];

    if (opts?.debug === true) {
      globalTransformers.push(debug());
    }

    const endpointDecFn = (...params: ArgFnParams): TEndpointDec => {
      const [path, transformers]: TEndpointDec = fn(...params);
      return [path, [...transformers, ...globalTransformers]];
    };

    return endpoint(endpointDecFn as ArgFn);
  };

  return {
    files: {
      getFile: build(files.getFile),
      getFileNodes: build(files.getFileNodes),
      getImage: build(files.getImage),
      getImageFills: build(files.getImageFills),
    },
    comments: {
      getComments: build(comments.getComments),
      postComments: build(comments.postComments),
      deleteComments: build(comments.deleteComments),
      getCommentsReactions: build(comments.getCommentsReactions),
      postCommentsReactions: build(comments.postCommentsReactions),
      deleteCommentsReactions: build(comments.deleteCommentsReactions),
    },
    users: {
      getMe: build(users.getMe),
    },
    versions: {
      getFileVersion: build(versions.getFileVersion),
    },
    projects: {
      getTeamProjects: build(projects.getTeamProjects),
      getProjectFiles: build(projects.getProjectFiles),
    },
    components: {
      getTeamComponents: build(components.getTeamComponents),
      getFileComponents: build(components.getFileComponents),
      getComponent: build(components.getComponent),
      getTeamComponentSets: build(components.getTeamComponentSets),
      getFileComponentSets: build(components.getFileComponentSets),
      getTeamStyles: build(components.getTeamStyles),
      getFileStyles: build(components.getFileStyles),
      getStyle: build(components.getStyle),
    },
    webhooks: {
      postWebhooks: build(webhooks.postWebhooks),
      getWebhooks: build(webhooks.getWebhooks),
      putWebhooks: build(webhooks.putWebhooks),
      deleteWebhooks: build(webhooks.deleteWebhooks),
      getTeamWebhooks: build(webhooks.getTeamWebhooks),
      getWebhooksRequests: build(webhooks.getWebhooksRequests),
    },
    logs: {
      getActivityLogs: build(logs.getActivityLogs),
    },
    payments: {
      getPayments: build(payments.getPayments),
    },
    variables: {
      getLocalVariables: build(variables.getLocalVariables),
      getPublishedVariables: build(variables.getPublishedVariables),
      postVariables: build(variables.postVariables),
    },
    dev_resources: {
      getDevResources: build(devResources.getDevResources),
      postDevResources: build(devResources.postDevResources),
      putDevResources: build(devResources.putDevResources),
      deleteDevResources: build(devResources.deleteDevResources),
    },
  };
};
