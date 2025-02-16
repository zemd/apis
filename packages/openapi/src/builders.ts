import { OpenSourceLicenses, type LicenseIdentifier } from "./licenses";
import type {
  LicenseObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ServerObject,
  ServerVariableObject,
  SpecificationExtensions,
} from "./types";

type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

const toJSON = <Res>(value: unknown): Res => {
  if (value instanceof Builder) {
    return value.toJSON() as unknown as Res;
  }
  if (Array.isArray(value)) {
    return value.map((val) => {
      return toJSON(val);
    }) as Res;
  }
  return structuredClone(value) as Res;
};

class Builder<ArgObj extends Record<PropertyKey, any>> {
  readonly #data: Map<keyof ArgObj, ArgObj[keyof ArgObj]> = new Map();
  #cache: ArgObj | null = null;

  set<
    ArgKey extends keyof ArgObj,
    ArgBuilder = ArgObj[ArgKey] extends Record<PropertyKey, any> ? Builder<Exclude<ArgObj[ArgKey], undefined>> : never,
  >(
    key: ArgKey,
    value:
      | Exclude<ArgObj[ArgKey], undefined>
      | (Exclude<ArgObj[ArgKey], undefined> extends (infer U)[] ? (ArgBuilder | U)[] : never)
      | (Exclude<ArgObj[ArgKey], undefined> extends Record<PropertyKey, any>
          ? Builder<Exclude<ArgObj[ArgKey], undefined>>
          : never),
  ): this {
    this.#data.set(key, toJSON<ArgObj[ArgKey]>(value));
    this.#cache = null;
    return this;
  }

  toJSON(): ArgObj {
    if (this.#cache) {
      return this.#cache;
    }
    const result = {} as ArgObj;
    for (const [key, value] of this.#data) {
      result[key] = value;
    }
    this.#cache = result;
    return result;
  }
}

export const builder = <ArgObj extends object>(params: {
  [k in RequiredKeys<ArgObj>]:
    | ArgObj[k]
    | (ArgObj[k] extends object ? Builder<ArgObj[k]> : never)
    | (ArgObj[k] extends (infer U)[] ? (U extends object ? (U | Builder<U>)[] : never) : never);
}): Builder<ArgObj> => {
  const builder = new Builder<ArgObj>();
  let key: RequiredKeys<ArgObj>;
  for (key in params) {
    const raw = params[key];
    const val = raw instanceof Builder ? raw.toJSON() : structuredClone(raw);
    builder.set(key, val);
  }
  return builder;
};

type ExtractVariables<T extends string> = T extends `${infer _Start}{${infer Variable}}${infer Rest}`
  ? Variable | ExtractVariables<Rest>
  : never;

export const buildServerObject = <ArgUrl extends string>(
  url: ArgUrl,
  params: {
    [k in ExtractVariables<ArgUrl>]: ServerVariableObject | string;
  },
  extensions: SpecificationExtensions = {},
): ServerObject => {
  const variables = {} as Record<string, ServerVariableObject>;
  let key: keyof typeof params;
  for (key in params) {
    const value = params[key];
    variables[key] = typeof value === "string" ? { default: value } : value;
  }

  return {
    url,
    variables,
    ...extensions,
  };
};

export const buildPathsObject = <ArgUrl extends `/${string}`, RestArgs = Omit<PathItemObject, "parameters">>(
  url: ArgUrl,
  rest: {
    [P in keyof RestArgs]: RestArgs[P];
  } & {
    parameters: Record<ExtractVariables<ArgUrl>, Omit<ParameterObject, "name">>;
  },
): PathsObject => {
  const parameters: ParameterObject[] = [];
  let key: keyof typeof rest.parameters;
  for (key in rest.parameters) {
    // @ts-expect-error expect error
    parameters.push({
      name: key,
      ...rest.parameters[key],
    });
  }

  return builder<PathsObject>({
    [url]: builder<PathItemObject>({
      ...rest,
      parameters,
    }),
  }).toJSON();
};

export const buildLicense = (identifier: LicenseIdentifier): LicenseObject => {
  const license = OpenSourceLicenses[identifier];
  return {
    name: license.short,
    identifier,
  };
};
