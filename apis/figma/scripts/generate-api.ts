import { parse } from "yaml";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { OperationObject, ParameterObject, PathItemObject, PathsObject, Schema } from "@zemd/openapi";
import { Project, VariableDeclarationKind } from "ts-morph";
import { camelCase, pascalCase } from "change-case";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildPathArguments = (pathParams: { name: string; origName: string; type: string }[]) => {
  return pathParams.reduce((acc: string, param: any) => {
    const arg = `${param.name}: ${param.type}`;
    if (acc) {
      return `${acc}, ${arg}`;
    }
    return arg;
  }, "");
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
    moduleSpecifier: "./utils",
    namedImports: ["figmaToken"],
  });

  const versionSet = new Set<string>();
  const namespaceMap = new Map<string, Set<string>>();
  const operations: any[] = [];
  const namedImports = new Set<string>();
  const apiServerUrl = data.servers?.at(0)?.url;

  for (const [path, methods] of Object.entries(data.paths as PathsObject)) {
    for (const [method, props] of Object.entries(methods as PathItemObject)) {
      const [, version, namespace] = path.split("/") as [undefined, string, string, ...string[]];

      const operationId = (props as OperationObject).operationId;
      const returnType = pascalCase(`${operationId}Response`);
      const parameters = (props as OperationObject).parameters as ParameterObject[] | undefined;

      versionSet.add(version);
      namespaceMap.set(version, (namespaceMap.get(version) ?? new Set()).add(namespace));
      namedImports.add(returnType);

      const pathParams =
        parameters
          ?.filter((param) => {
            return param.in === "path";
          })
          .map((param) => {
            const name = param.name;
            const type = `${pascalCase(operationId ?? "")}PathParams`;

            namedImports.add(type);

            return {
              origName: name,
              name: camelCase(name ?? ""),
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
        const type = `${pascalCase(operationId ?? "")}QueryParams`;

        namedImports.add(type);

        queryParams = {
          type,
          required: allQueryParams.some((param) => {
            return param.required === true;
          }),
        };
      }

      let bodyParams = null;
      const requestBody = (props as OperationObject).requestBody;
      if (requestBody) {
        namedImports.add(`${pascalCase(operationId ?? "")}RequestBody`);

        bodyParams = {
          type: `${pascalCase(operationId ?? "")}RequestBody`,
        };
      }

      operations.push({
        method,
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
          writer.write(`(accessToken: string) => {`).indent();

          writer
            .write(`const endpoint = createEndpoint([prefix("${apiServerUrl}"), json(), figmaToken(accessToken)]);`)
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

                    const optionalTransformers: boolean = operation?.queryParams && !operation.queryParams.required;

                    let requiredTransformers = [
                      `method("${operation.method.toUpperCase()}")`,
                      operation.bodyParams && `body(JSON.stringify(obj))`,
                      operation?.queryParams && operation.queryParams.required && `query(options)`,
                    ]
                      .filter(Boolean)
                      .join(",");
                    requiredTransformers = `[${requiredTransformers}]`;

                    writer.write(`${operation.operationId}: async (${funcArguments}) => `).indent();
                    writer.block(() => {
                      if (optionalTransformers) {
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

  await sourceFile.save();
  console.log("Source file generated successfully");
}

async function main() {
  const filePath = fileURLToPath(import.meta.resolve("@figma/rest-api-spec/openapi/openapi.yaml"));
  const openapi = await readFile(filePath, "utf8");
  const data = await parse(openapi);
  // await writeFile(resolve(__dirname, "..", "dist", "openapi.json"), JSON.stringify(data, null, 2), "utf8");

  await generateApi(data);
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error: unknown) => {
    console.error(error);
  });
