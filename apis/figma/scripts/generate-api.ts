import { parse } from "yaml";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type { OperationObject, ParameterObject, PathItemObject, Schema } from "@zemd/openapi";
import { Project, VariableDeclarationKind } from "ts-morph";
import { camelCase, pascalCase } from "change-case";

const __dirname = import.meta.dirname;

interface PathParam {
  origName: string;
  name: string;
  type: string;
}

interface Operation {
  method: string;
  operationId: string;
  path: string;
  pathTemplate: string;
  version: string;
  namespace: string;
  pathParams: PathParam[];
  queryParams: { type: string; required: boolean } | null;
  bodyParams: { type: string } | null;
  returnType: string;
}

const buildPathArguments = (pathParams: PathParam[]) => {
  return pathParams
    .map((p) => {
      return `${p.name}: ${p.type}`;
    })
    .join(", ");
};

async function generateApi(data: Schema) {
  const project = new Project();
  const sourceFile = project.createSourceFile(resolve(__dirname, "..", "src", "api.ts"), undefined, {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@zemd/http-client",
    namedImports: ["createEndpoint", "query", "body", "method", "prefix", "json"],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@zemd/http-client",
    namedImports: ["TFetchTransformer"],
    isTypeOnly: true,
  });

  if (!data.paths) {
    throw new Error("OpenAPI spec has no paths");
  }
  const apiServerUrl = data.servers?.at(0)?.url;
  if (!apiServerUrl) {
    throw new Error("OpenAPI spec has no server URL");
  }

  const versionSet = new Set<string>();
  const namespaceMap = new Map<string, Set<string>>();
  const operations: Operation[] = [];
  const namedImports = new Set<string>();

  for (const [path, methods] of Object.entries(data.paths)) {
    for (const [httpMethod, props] of Object.entries(methods as PathItemObject)) {
      const segments = path.split("/");
      const version = segments[1];
      const namespace = segments[2];
      if (!version || !namespace) {
        throw new Error(`Unexpected path format: ${path}`);
      }

      const { operationId, parameters: rawParameters, requestBody, responses } = props as OperationObject;
      if (!operationId) {
        throw new Error(`Missing operationId for ${httpMethod.toUpperCase()} ${path}`);
      }

      const successResponse = responses?.["200"];
      let returnType: string;
      if (successResponse && "$ref" in successResponse) {
        const refName = successResponse.$ref.split("/").at(-1);
        if (!refName) {
          throw new Error(`Invalid $ref for 200 response in ${httpMethod.toUpperCase()} ${path}`);
        }
        returnType = refName;
      } else {
        returnType = pascalCase(`${operationId}Response`);
      }
      const parameters = rawParameters as ParameterObject[] | undefined;

      versionSet.add(version);
      namespaceMap.set(version, (namespaceMap.get(version) ?? new Set()).add(namespace));
      namedImports.add(returnType);

      const pathParams =
        parameters
          ?.filter((param) => {
            return param.in === "path";
          })
          .map((param) => {
            const name = param.name ?? "";
            const type = `${pascalCase(operationId)}PathParams`;

            namedImports.add(type);

            return {
              origName: name,
              name: camelCase(name),
              type: `${type}["${name}"]`,
            };
          }) ?? [];

      const pathTemplate = pathParams.reduce((acc, param) => {
        return acc.replace(`{${param.origName}}`, `\${${param.name}}`);
      }, path);

      let queryParams = null;
      const allQueryParams =
        parameters?.filter((param) => {
          return param.in === "query";
        }) ?? ([] as ParameterObject[]);

      if (allQueryParams.length > 0) {
        const type = `${pascalCase(operationId)}QueryParams`;

        namedImports.add(type);

        queryParams = {
          type,
          required: allQueryParams.some((param) => {
            return param.required === true;
          }),
        };
      }

      let bodyParams = null;
      if (requestBody) {
        namedImports.add(`${pascalCase(operationId)}RequestBody`);

        bodyParams = {
          type: `${pascalCase(operationId)}RequestBody`,
        };
      }

      operations.push({
        method: httpMethod,
        operationId,
        path,
        pathTemplate,
        version,
        namespace,
        pathParams,
        queryParams,
        bodyParams,
        returnType,
      });
    }
  }

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: "figma",
        initializer: (writer) => {
          writer.write(`(initialTransformers: TFetchTransformer[]) => {`).indent();

          writer
            .write(`const endpoint = createEndpoint([prefix("${apiServerUrl}"), json(), ...initialTransformers]);`)
            .newLine();

          writer.write(`return (`);
          writer.inlineBlock(() => {
            for (const version of versionSet) {
              writer.write(`${version}: `).indent();
              writer.block(() => {
                const versionNamespaces = namespaceMap.get(version) ?? new Set();
                for (const namespace of versionNamespaces) {
                  writer.write(`${namespace}: {`).indent();
                  const operationsFiltered = operations.filter((op) => {
                    return op.version === version && op.namespace === namespace;
                  });
                  for (const operation of operationsFiltered) {
                    const funcArguments = [
                      buildPathArguments(operation.pathParams),
                      operation.bodyParams && `obj: ${operation.bodyParams.type}`,
                      operation.queryParams &&
                        `options${operation.queryParams.required ? "" : "?"}: ${operation.queryParams.type}`,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const queryIsOptional: boolean = !!operation.queryParams && !operation.queryParams.required;

                    let requiredTransformers = [
                      `method("${operation.method.toUpperCase()}")`,
                      operation.bodyParams && `body(JSON.stringify(obj))`,
                      operation.queryParams && operation.queryParams.required && `query(options)`,
                    ]
                      .filter(Boolean)
                      .join(",");
                    requiredTransformers = `[${requiredTransformers}]`;

                    writer.write(`${operation.operationId}: async (${funcArguments}) => `).indent();
                    writer.block(() => {
                      if (queryIsOptional) {
                        writer.write(`const transformers = ${requiredTransformers};`).indent();
                        writer.write(`if (options) { transformers.push(query(options)); }`).indent();
                        requiredTransformers = "transformers";
                      }
                      writer
                        .write(
                          `return endpoint<${operation.returnType}>(\`${operation.pathTemplate}\`, ${requiredTransformers})`,
                        )
                        .indent();
                    });
                    writer.write(`,`).newLine(); // ends operation function
                  }
                  writer.write(`},`).newLine(); // ends namespace
                }
              });
              writer.write(`,`).newLine(); // ends version
            }
            writer.write(``); // ends
          });
          writer.write(`)`);
          writer.write(`}`);
        },
      },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@figma/rest-api-spec",
    isTypeOnly: true,
    namedImports: [...namedImports],
  });

  sourceFile.organizeImports();
  await sourceFile.save();
  console.log("Source file generated successfully");
}

async function main() {
  const filePath = fileURLToPath(import.meta.resolve("@figma/rest-api-spec/openapi/openapi.yaml"));
  const openapi = await readFile(filePath, "utf8");
  const data = await parse(openapi);

  await generateApi(data);
  await writeFile(resolve(__dirname, "..", "src", "openapi.json"), JSON.stringify(data, null, 2), "utf8");
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error: unknown) => {
    console.error(error);
  });
