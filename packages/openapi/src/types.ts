import type { LicenseIdentifier } from "./licenses";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [infer Head, ...infer Rem]
  ? MergeTypes<Rem, Res & Head>
  : Res;

export type OneOf<TypesArray extends any[], Res = never, AllProperties = MergeTypes<TypesArray>> = TypesArray extends [
  infer Head,
  ...infer Rem,
]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
  : Res;

export type JSONValue = string | number | boolean | null | { [k: string]: JSONValue } | JSONValue[];

export type MediaType =
  | "text/plain; charset=utf-8"
  | "text/html"
  | "application/xml"
  | "application/json"
  | "application/x-www-form-urlencoded"
  | `application/vnd.${string}+json`
  | `application/vnd.${string}.v${number}+json`
  | `application/vnd.${string}.v${number}.raw+json`
  | `application/vnd.${string}.v${number}.text+json`
  | `application/vnd.${string}.v${number}.html+json`
  | `application/vnd.${string}.v${number}.full+json`
  | `application/vnd.${string}.v3.diff`
  | `application/vnd.${string}.v3.patch`
  | (string & {});

// https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
export const statusCodes = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  104: "Upload Resumption Supported (TEMPORARY - registered 2024-11-13, expires 2025-11-13)",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "(Unused)",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Content Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "(Unused)",
  421: "Misdirected Request",
  422: "Unprocessable Content",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  427: "Unassigned",
  428: "Precondition Required",
  429: "Too Many Requests",
  430: "Unassigned",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Unassigned",
  510: "Not Extended (OBSOLETED)",
  511: "Network Authentication Required",
} as const;

export type StatusCode = keyof typeof statusCodes | (number & {});

export const DataTypes = ["null", "boolean", "number", "string", "array", "object", "integer"] as const;
export type DataType = (typeof DataTypes)[number];

// The OpenAPI Specification is versioned using a major.minor.patch versioning scheme.
export type Version = `${number}.${number}.${number}`;

/**
 * While the OpenAPI Specification tries to accommodate most use cases,
 * additional data can be added to extend the specification at certain points.
 *
 * The extensions properties are implemented as patterned fields that are always prefixed by x-.
 * see https://spec.openapis.org/oas/latest.html#specification-extensions
 */
export type SpecificationExtensions = Partial<{
  /**
   * Field names beginning x-oai- and x-oas- are reserved for uses defined by
   * the OpenAPI Initiative. The value can be any valid JSON value
   * (null, a primitive, an array, or an object.)
   */
  [key: `x-${string}`]: JSONValue;
}>;

/**
 * Contact information for the exposed API
 * see https://spec.openapis.org/oas/latest.html#contact-object
 */
export type ContactObject = {
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string;
  /**
   * The URI for the contact information. This MUST be in the form of a URI.
   */
  url?: string;
  /**
   * The email address of the contact person/organization.
   * This MUST be in the form of an email address.
   */
  email?: `${string}@${string}`;
} & SpecificationExtensions;

type LicenseCommonObject = {
  /**
   * The license name used for the API.
   */
  name: string;
} & SpecificationExtensions;

/**
 * License information for the exposed API.
 * see https://spec.openapis.org/oas/latest.html#license-object
 */
export type LicenseObject = OneOf<
  [
    LicenseCommonObject & {
      /**
       * An SPDX-Licenses expression for the API. The identifier field is mutually
       * exclusive of the url field.
       * see https://spdx.org/licenses/
       */
      identifier?: LicenseIdentifier | (string & {});
    },
    LicenseCommonObject & {
      /**
       * A URI for the license used for the API. This MUST be in the form of a URI.
       * The url field is mutually exclusive of the identifier field.
       */
      url?: string;
    },
  ]
>;

/**
 * The object provides metadata about the API. The metadata MAY be used by the clients
 * if needed, and MAY be presented in editing or documentation generation tools for convenience.
 * see https://spec.openapis.org/oas/latest.html#info-object
 */
export type InfoObject = {
  title: string;
  summary?: string;
  description?: string;
  /**
   * A URI for the Terms of Service for the API. This MUST be in the form of a URI.
   */
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  /**
   * The version of the OpenAPI Document (which is distinct from the OpenAPI Specification
   * version or the version of the API being described or the version of the OpenAPI Description).
   */
  version: Version;
} & SpecificationExtensions;

/**
 * An object representing a Server Variable for server URL template substitution.
 * see https://spec.openapis.org/oas/latest.html#server-variable-object
 */
export type ServerVariableObject = {
  enum?: string[];
  default: string;
  description?: string;
} & SpecificationExtensions;

/**
 * An object representing a Server.
 * see https://spec.openapis.org/oas/latest.html#server-object
 */
export type ServerObject = {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
} & SpecificationExtensions;

/**
 * When request bodies or response payloads may be one of a number of different schemas,
 * a Discriminator Object gives a hint about the expected schema of the document.
 * see https://spec.openapis.org/oas/latest.html#discriminator-object
 */
export type DiscriminatorObject = {
  propertyName: string;
  mapping?: Record<string, string>;
} & SpecificationExtensions;

/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 * see https://spec.openapis.org/oas/latest.html#xml-object
 */
export type XMLObject = {
  name?: string;
  /**
   * The URI of the namespace definition. Value MUST be in the form of a non-relative URI
   */
  namespace?: string;
  prefix?: string;
  /**
   * Declares whether the property definition translates to an attribute instead of an element.
   * Default value is false.
   */
  attribute?: boolean;
  /**
   * MAY be used only for an array definition.
   */
  wrapped?: boolean;
} & SpecificationExtensions;

/**
 * Allows referencing an external resource for extended documentation.
 * see https://spec.openapis.org/oas/latest.html#external-documentation-object
 */
export type ExternalDocumentationObject = {
  description?: string;
  /**
   * The URI for the target documentation. This MUST be in the form of a URI.
   */
  url: string;
} & SpecificationExtensions;

type JSONSchemaPrimitive = "string" | "number" | "integer" | "boolean" | "null";
// type JSONSchemaType = "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";

type JSONSchemaObject = {
  type: "object";
  /**
   * The value of "properties" MUST be an object. Each value of this object MUST be a valid
   * JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-properties
   */
  properties: Record<string, JSONSubSchema>;
  /**
   * The value of this keyword MUST be an array. Elements of this array, if any, MUST be strings,
   * and MUST be unique.
   * An object instance is valid against this keyword if every item in the array is the name of a
   * property in the instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-required
   */
  required?: string[];
  /**
   * The value of "patternProperties" MUST be an object. Each property name of this object
   * SHOULD be a valid regular expression, according to the ECMA-262 regular expression dialect.
   * Each property value of this object MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-patternproperties
   */
  patternProperties?: Record<string, JSONSubSchema | false>;
  /**
   * The value of "additionalProperties" MUST be a valid JSON Schema.
   * The behavior of this keyword depends on the presence and annotation results of "properties"
   * and "patternProperties" within the same schema object. Validation with "additionalProperties"
   * applies only to the child values of instance names that do not appear in the annotation
   * results of either "properties" or "patternProperties".
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-additionalproperties
   */
  additionalProperties?: boolean;
  /**
   * see https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-11.3
   */
  unevaluatedProperties?: JSONSubSchema | false;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An object instance is valid against "minProperties" if its number of properties is greater
   * than, or equal to, the value of this keyword.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-minproperties
   */
  minProperties?: number;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An object instance is valid against "maxProperties" if its number of properties is less than,
   * or equal to, the value of this keyword.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maxproperties
   */
  maxProperties?: number;
  /**
   * The value of "propertyNames" MUST be a valid JSON Schema.
   * If the instance is an object, this keyword validates if every property name in the instance
   * validates against the provided schema. Note the property name that the schema is testing will
   * always be a string.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-propertynames
   */
  propertyNames?: JSONSubSchema;
  /**
   * The value of this keyword MUST be an object. Properties in this object, if any, MUST be arrays.
   * Elements in each array, if any, MUST be strings, and MUST be unique.
   * This keyword specifies properties that are required if a specific other property is present.
   * Their requirement is dependent on the presence of the other property.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-dependentrequired
   */
  dependentRequired?: Record<string, string[]>;
  /**
   * This keyword specifies subschemas that are evaluated if the instance is an object and
   * contains a certain property.
   * This keyword's value MUST be an object. Each value in the object MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-dependentschemas
   */
  dependentSchemas?: Record<string, JSONSubSchema>;
  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#section-10.2.2.1
   */
  if?: JSONSchemaObject;
  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-then
   */
  then?: JSONSchemaObject;
  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-else
   */
  else?: JSONSchemaObject;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: Record<string, JSONValue>;
};

type JSONSchemaArray = {
  type: "array";
  /**
   * The value of "items" MUST be a valid JSON Schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-items
   */
  items: (JSONSubSchema & SchemaObjectFixedFields) | false;
  /**
   * see https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-11.2
   */
  unevaluatedItems?: JSONSubSchema | false;
  /**
   * The value of "prefixItems" MUST be a non-empty array of valid JSON Schemas.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-prefixitems
   */
  prefixItems?: JSONSubSchema[];
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An array instance is valid against "minItems" if its size is greater than, or equal to, the
   * value of this keyword.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-minitems
   */
  minItems?: number;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An array instance is valid against "maxItems" if its size is less than, or equal to, the
   * value of this keyword.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maxitems
   */
  maxItems?: number;
  /**
   * The value of this keyword MUST be a boolean.
   * If this keyword has boolean value false, the instance validates successfully. If it has
   * boolean value true, the instance validates successfully if all of its elements are unique.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-uniqueitems
   */
  uniqueItems?: boolean;
  /**
   * The value of this keyword MUST be a valid JSON Schema.
   * An array instance is valid against "contains" if at least one of its elements is valid
   * against the given schema, except when "minContains" is present and has a value of 0,
   * in which case an array instance MUST be considered valid against the "contains" keyword,
   * even if none of its elements is valid against the given schema.
   *
   * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-contains
   */
  contains?: JSONSubSchema;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An instance array is valid against "minContains" in two ways, depending on the form of
   * the annotation result of an adjacent "contains" keyword. The first way is if the annotation
   * result is an array and the length of that array is greater than or equal to the "minContains"
   * value. The second way is if the annotation result is a boolean "true" and the instance array
   * length is greater than or equal to the "minContains" value.
   *
   * Omitting this keyword has the same behavior as a value of 1.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-mincontains
   */
  minContains?: number;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * An instance array is valid against "maxContains" in two ways, depending on the form of
   * the annotation result of an adjacent "contains" keyword. The first way is if the annotation
   * result is an array and the length of that array is less than or equal to the "maxContains"
   * value. The second way is if the annotation result is a boolean "true" and the instance array
   * length is less than or equal to the "maxContains" value.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maxcontains
   */
  maxContains?: number;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: JSONValue[];
} & SchemaObjectFixedFields;

type JSONSchemaString = {
  type: "string";
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-contentencoding
   */
  contentEncoding?: string;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-contentmediatype
   */
  contentMediaType?: string;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-contentschema
   */
  contentSchema?: JSONSubSchema;
  /**
   * The value of this keyword MUST be a non-negative integer.
   * A string instance is valid against this keyword if its length is greater than, or equal to,
   * the value of this keyword.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-minlength
   */
  minLength?: number;
  /**
   * The value of this keyword MUST be a non-negative integer.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maxlength
   */
  maxLength?: number;
  /**
   * The value of this keyword MUST be a string. This string SHOULD be a valid regular expression,
   * according to the ECMA-262 regular expression dialect.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-pattern
   */
  pattern?: string;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: string;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-defined-formats
   */
  format?:
    | "date-time"
    | "date"
    | "time"
    | "duration"
    | "email"
    | "idn-email"
    | "hostname"
    | "idn-hostname"
    | "ipv4"
    | "ipv6"
    | "uuid"
    | "uri"
    | "uri-reference"
    | "iri"
    | "iri-reference"
    | "json-pointer"
    | "relative-json-pointer"
    | "regex";
};

type JSONSchemaNumber = {
  type: "number";
  /**
   * The value of "exclusiveMinimum" MUST be a number, representing an exclusive lower limit for
   * a numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-exclusiveminimum
   */
  exclusiveMinimum?: number;
  /**
   * The value of "exclusiveMaximum" MUST be a number, representing an exclusive upper limit for
   * a numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-exclusivemaximum
   */
  exclusiveMaximum?: number;
  /**
   * The value of "multipleOf" MUST be a number, strictly greater than 0.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-multipleof
   */
  multipleOf?: number;
  /**
   * The value of "minimum" MUST be a number, representing an inclusive lower limit for a
   * numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-minimum
   */
  minimum?: number;
  /**
   * The value of "maximum" MUST be a number, representing an inclusive upper limit for a
   * numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maximum
   */
  maximum?: number;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: number;
};

type JSONSchemaInteger = {
  type: "integer";
  format?: "int32" | "int64";
  /**
   * The value of "minimum" MUST be a number, representing an inclusive lower limit for a
   * numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-minimum
   */
  minimum?: number;
  /**
   * The value of "maximum" MUST be a number, representing an inclusive upper limit for a
   * numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-maximum
   */
  maximum?: number;
  /**
   * The value of "exclusiveMaximum" MUST be a number, representing an exclusive upper limit for
   * a numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-exclusivemaximum
   */
  exclusiveMaximum?: number;
  /**
   * The value of "exclusiveMinimum" MUST be a number, representing an exclusive lower limit for
   * a numeric instance.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-exclusiveminimum
   */
  exclusiveMinimum?: number;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: number;
  /**
   * The value of "multipleOf" MUST be a number, strictly greater than 0.
   *
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-multipleof
   */
  multipleOf?: number;
};

type JSONSchemaRef = JSONSchemaDirectRef | JSONSchemaDynamicRef;

/**
 * The "$ref" keyword is an applicator that is used to reference a statically identified schema.
 * The value of the "$ref" keyword MUST be a string which is a URI-Reference. Resolved against the
 * current URI base, it produces the URI of the schema to apply.
 * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-direct-references-with-ref
 */
type JSONSchemaDirectRef = {
  $ref: string;
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: JSONValue; // Since the $ref can reference any schema, the default value type is not known.
};

/**
 * The "$dynamicRef" keyword is an applicator that allows for deferring the full resolution until
 * runtime, at which point it is resolved each time it is encountered while evaluating an instance.
 * The value of the "$dynamicRef" property MUST be a string which is a URI-Reference.
 *
 * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-dynamic-references-with-dyn
 */
type JSONSchemaDynamicRef = {
  $dynamicRef: string;
};

type JSONSchemaBoolean = {
  type: "boolean";
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: boolean;
};

/**
 * The value of this keyword MAY be of any type, including null.
 * see https://json-schema.org/draft/2020-12/json-schema-validation#name-const
 */
type JSONSchemaConst = { const: JSONValue };
type JSONSchemaNull = { type: "null" };
type JSONSchemaAny = {
  type: JSONSchemaPrimitive[];
  // TODO: According to the spec, this should also accept assertions from specified types
  //  the typescript definition is not complete. see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#section-7.6.1
  /**
   * see https://json-schema.org/draft/2020-12/json-schema-validation#name-default
   */
  default?: JSONValue;
};

export type JSONSubSchema = Prettify<
  {
    /**
     * The "$id" keyword identifies a schema resource with its canonical RFC6596 URI.
     * The presence of "$id" in a subschema indicates that the subschema constitutes a distinct
     * schema resource within a single schema document.
     * The root schema of a JSON Schema document SHOULD contain an "$id" keyword with an absolute-URI.
     * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#section-8.2.1
     */
    $id?: string;
    /**
     * The "$defs" keyword reserves a location for schema authors to inline re-usable JSON Schemas
     * into a more general schema.
     *
     * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-schema-re-use-with-defs
     */
    $defs?: Record<string, Partial<JSONSubSchema>>;
    /**
     * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid
     * JSON Schema
     */
    allOf?: JSONSchemaDirectRef[];
    /**
     * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid
     * JSON Schema.
     */
    oneOf?: Partial<JSONSubSchema>[];
    /**
     * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid
     * JSON Schema.
     */
    anyOf?: Partial<JSONSubSchema>[];
    /**
     * This keyword's value MUST be a valid JSON Schema.
     */
    not?: JSONSchemaConst;
    /**
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-title-and-description
     */
    title?: string;
    /**
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-title-and-description
     */
    description?: string;
    /**
     * The value of this keyword MUST be a boolean.
     * A root schema containing "deprecated" with a value of true indicates that the entire
     * resource being described MAY be removed in the future.
     *
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-deprecated
     */
    deprecated?: boolean;
    /**
     * If "readOnly" has a value of boolean true, it indicates that the value of the instance
     * is managed exclusively by the owning authority, and attempts by an application to modify
     * the value of this property are expected to be ignored or rejected by that owning authority.
     *
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-readonly-and-writeonly
     */
    readOnly?: boolean;
    /**
     * If "writeOnly" has a value of boolean true, it indicates that the value is never present
     * when the instance is retrieved from the owning authority. It can be present when sent to
     * the owning authority to update or create the document (or the resource it represents),
     * but it will not be included in any updated or newly created version of the instance.
     *
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-readonly-and-writeonly
     */
    writeOnly?: boolean;
    /**
     * This keyword reserves a location for comments from schema authors to readers or maintainers
     * of the schema.
     * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#name-comments-with-comment
     */
    $comment?: string;
    $anchor?: string;
    /**
     * This keyword can be used to provide sample JSON values associated with a particular schema,
     * for the purpose of illustrating usage.
     *
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-examples
     */
    examples?: JSONValue[];
    /**
     * The value of this keyword MUST be an array. This array SHOULD have at least one element.
     * Elements in the array SHOULD be unique.
     * Elements in the array might be of any type, including null.
     *
     * see https://json-schema.org/draft/2020-12/json-schema-validation#name-enum
     */
    enum?: JSONValue[];
  } & (
    | JSONSchemaObject
    | JSONSchemaArray
    | JSONSchemaString
    | JSONSchemaInteger
    | JSONSchemaNumber
    | JSONSchemaBoolean
    | JSONSchemaNull
    | JSONSchemaAny
    | JSONSchemaConst
    | JSONSchemaRef
  )
>;

/**
 * The root schema is the schema that comprises the entire JSON document in question.
 * The root schema is always a schema resource, where the URI.
 *
 * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01
 */
export type JSONRootSchema = Prettify<
  {
    /**
     * The "$schema" keyword is both used as a JSON Schema dialect identifier and as the
     * identifier of a resource which is itself a JSON Schema, which describes the set of
     * valid schemas written for this particular dialect.
     *
     * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#section-8.1.1
     */
    $schema: "https://json-schema.org/draft/2020-12/schema" | (string & {});
    /**
     * The "$vocabulary" keyword, when it appears in a meta-schema, declares which vocabularies
     * are available to be used in schemas that refer to that meta-schema. Vocabularies define
     * keyword semantics, as well as their general syntax.
     *
     * see https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01#section-8.1.2
     */
    $vocabulary?: "https://json-schema.org/draft/2020-12/vocab/core" | (string & {}) | Record<string, boolean>;
  } & JSONSubSchema
>;

type SchemaObjectFixedFields = {
  discriminator?: DiscriminatorObject;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
};

/**
 * The Schema Object allows the definition of input and output data types. These types can
 * be objects, but also primitives and arrays. This object is a superset of the
 * JSON Schema Specification Draft 2020-12.
 *
 * Unless stated otherwise, the keyword definitions follow those of JSON Schema and do not
 * add any additional semantics; this includes keywords such as $schema, $id, $ref, and
 * $dynamicRef being URIs rather than URLs.
 *
 * see https://spec.openapis.org/oas/latest.html#schema-object
 */
export type SchemaObject = (SchemaObjectFixedFields & SpecificationExtensions & JSONSubSchema) | boolean;

/**
 * A simple object to allow referencing other components in the OpenAPI Description,
 * internally and externally.
 *
 * The $ref string value contains a URI RFC3986, which identifies the value being referenced.
 * see https://spec.openapis.org/oas/latest.html#reference-object
 */
export type ReferenceObject = {
  /**
   * The reference identifier. This MUST be in the form of a URI.
   */
  $ref: string;
  /**
   * A short summary which by default SHOULD override that of the referenced component.
   */
  summary?: string;
  /**
   * A description which by default SHOULD override that of the referenced component.
   * CommonMark syntax MAY be used for rich text representation.
   */
  description?: string;
};

/**
 * An object grouping an internal or external example value with basic summary and
 * description metadata.
 * see https://spec.openapis.org/oas/latest.html#example-object
 */
export type ExampleObject = {
  /**
   * Short description for the example.
   */
  summary?: string;
  description?: string;
} & SpecificationExtensions &
  (
    | {
        /**
         * Embedded literal example. The value field and externalValue field are mutually exclusive.
         * To represent examples of media types that cannot naturally represented in JSON or YAML,
         * use a string value to contain the example, escaping where necessary.
         */
        value?: string;
      }
    | {
        /**
         * A URI that identifies the literal example. This provides the capability to reference
         * examples that cannot easily be included in JSON or YAML documents. The value field
         * and externalValue field are mutually exclusive.
         */
        externalValue?: string;
      }
  );

/**
 * A single encoding definition applied to a single schema property.
 * see https://spec.openapis.org/oas/latest.html#encoding-object
 */
export type EncodingObject = {
  contentType?: string;
  headers?: Record<string, HeaderObject | ReferenceObject>;
} & SpecificationExtensions & {
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
  };

/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 * see https://spec.openapis.org/oas/latest.html#media-type-object
 */
export type MediaTypeObject = {
  schema?: SchemaObject;
  example?: any;
  examples?: Record<string, OneOf<[ExampleObject | ReferenceObject]>>;
  encoding?: Record<string, EncodingObject>;
} & SpecificationExtensions;

/**
 * Describes a single header for HTTP responses and for individual parts in multipart
 * representations; see the relevant Response Object and Encoding Object documentation
 * for restrictions on which headers can be described.
 * see https://spec.openapis.org/oas/latest.html#header-object
 */
export type HeaderObject = {
  /**
   * A brief description of the header. This could contain examples of use.
   */
  description?: string;
  /**
   * Determines whether this header is mandatory.
   * The default value is false.
   */
  required?: boolean;
  /**
   * Specifies that the header is deprecated and SHOULD be transitioned out of usage.
   * Default value is false.
   */
  deprecated?: boolean;
} & SpecificationExtensions &
  (
    | {
        style?: string;
        explode?: boolean;
        schema: SchemaObject | ReferenceObject;
        example?: any;
        examples?: Record<string, ExampleObject | ReferenceObject>;
      }
    | {
        content: Record<string, MediaTypeObject>;
      }
  );

/**
 * The Link Object represents a possible design-time link for a response.
 * see https://spec.openapis.org/oas/latest.html#link-object
 */
export type LinkObject = {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, any>;
  requestBody?: any;
  description?: string;
  server?: ServerObject;
} & SpecificationExtensions;

/**
 * Describes a single response from an API operation, including design-time,
 * static links to operations based on the response.
 * see https://spec.openapis.org/oas/latest.html#response-object
 */
export type ResponseObject = {
  description: string;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /**
   * A map containing descriptions of potential response payloads.
   */
  content?: Record<string, MediaTypeObject>;
  /**
   * A map of operations links that can be followed from the response.
   */
  links?: Record<string, LinkObject | ReferenceObject>;
} & SpecificationExtensions;

/**
 * Describes a single operation parameter.
 * see https://spec.openapis.org/oas/latest.html#parameter-object
 */
export type ParameterObject = Prettify<
  ({
    name?: string;
    description?: string;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
  } & SpecificationExtensions &
    OneOf<
      [
        {
          schema: SchemaObject;
          /**
           * see https://spec.openapis.org/oas/latest.html#style-values
           */
          style?: string;
          explode?: boolean;
          allowReserved?: boolean;
          example?: any;
          examples?: Record<string, ExampleObject | ReferenceObject>;
        },
        { content: Record<string, MediaTypeObject> },
      ]
    >) &
    ({ in: "query"; required: true } | { in: "header" | "path" | "cookie"; required?: boolean })
>;

/**
 * Describes a single request body.
 * see https://spec.openapis.org/oas/latest.html#request-body-object
 */
export type RequestBodyObject = {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
} & SpecificationExtensions;

/**
 * Configuration details for a supported OAuth Flow
 * see https://spec.openapis.org/oas/latest.html#oauth-flow-object
 */
export type OAuthFlowObject<T extends OAuthFlow> = (T extends "implicit" | "authorizationCode"
  ? { authorizationUrl: string }
  : T extends "password" | "clientCredentials" | "authorizationCode"
    ? { tokenUrl: string }
    : never) & { refreshUrl?: string; scopes: Record<string, string> } & SpecificationExtensions;

export const OAuthFlows = ["implicit", "password", "clientCredentials", "authorizationCode"] as const;
export type OAuthFlow = (typeof OAuthFlows)[number];

/**
 * Allows configuration of the supported OAuth Flows.
 * see https://spec.openapis.org/oas/latest.html#oauth-flows-object
 */
export type OAuthFlowsObject = {
  /**
   * Configuration for the OAuth Implicit flow
   */
  implicit?: Prettify<OAuthFlowObject<"implicit">>;
  /**
   * Configuration for the OAuth Resource Owner Password flow
   */
  password?: Prettify<OAuthFlowObject<"password">>;
  /**
   * Configuration for the OAuth Client Credentials flow. Previously called application
   * in OpenAPI 2.0.
   */
  clientCredentials?: Prettify<OAuthFlowObject<"clientCredentials">>;
  /**
   * Configuration for the OAuth Authorization Code flow. Previously called accessCode
   * in OpenAPI 2.0.
   */
  authorizationCode?: Prettify<OAuthFlowObject<"authorizationCode">>;
} & SpecificationExtensions;

/**
 * Defines a security scheme that can be used by the operations.
 * see https://spec.openapis.org/oas/latest.html#security-scheme-object-0
 */
export type SecuritySchemeObject = {
  description?: string;
} & (
  | {
      type: "apiKey";
      /**
       * The name of the header, query or cookie parameter to be used.
       */
      name: string;
      in: "query" | "header" | "cookie";
    }
  | {
      type: "http";
      scheme: "basic" | (string & {});
      bearerFormat?: string;
    }
  | {
      type: "oauth2";
      flows: OAuthFlowsObject;
    }
  | {
      type: "openIdConnect";
      openIdConnectUrl: string;
    }
  | {
      type: "mutualTLS";
    }
) &
  SpecificationExtensions;

/**
 * A container for the expected responses of an operation.
 * see https://spec.openapis.org/oas/latest.html#responses-object
 */
export type ResponsesObject = {
  default?: ResponseObject | ReferenceObject;
} & {
  [statusCode in StatusCode]?: ResponseObject | ReferenceObject;
} & SpecificationExtensions;

/**
 * Lists the required security schemes to execute this operation.
 * An empty Security Requirement Object ({}) indicates anonymous access is supported.
 * see https://spec.openapis.org/oas/latest.html#security-requirement-object
 */
export type SecurityRequirementObject = {
  /**
   * Each name MUST correspond to a security scheme which is declared in the Security Schemes
   * under the Components Object.
   */
  [name: string]: string[];
};

/**
 * Describes a single API operation on a path
 * see https://spec.openapis.org/oas/latest.html#operation-object
 */
export type OperationObject = {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: Prettify<OneOf<[RequestBodyObject, ReferenceObject]>>;
  responses?: ResponsesObject;
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
} & SpecificationExtensions;

/**
 * Describes the operations available on a single path.
 * see https://spec.openapis.org/oas/latest.html#path-item-object
 */
export type PathItemObject = {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
} & SpecificationExtensions;

/**
 * A map of possible out-of band callbacks related to the parent operation.
 * see https://spec.openapis.org/oas/latest.html#callback-object
 */
export type CallbackObject = {
  [key: string]: PathItemObject | undefined;
} & SpecificationExtensions;

/**
 * Holds a set of reusable objects for different aspects of the OAS.
 * All objects defined within the Components Object will have no effect on
 * the API unless they are explicitly referenced from outside the Components Object.
 *
 * All the fixed fields declared above are objects that MUST use keys
 * that match the regular expression: ^[a-zA-Z0-9\.\-_]+$.
 * see https://spec.openapis.org/oas/latest.html#components-object
 */
export type ComponentsObject = {
  schemas?: Record<string, SchemaObject>;
  responses?: Record<string, ResponseObject | ReferenceObject>;
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  links?: Record<string, LinkObject | ReferenceObject>;
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  pathItems?: Record<string, PathItemObject>;
};

/**
 * Holds the relative paths to the individual endpoints and their operations.
 * see https://spec.openapis.org/oas/latest.html#paths-object
 */
export type PathsObject = {
  [path: `/${string}`]: PathItemObject;
} & SpecificationExtensions;

/**
 * Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to
 * have a Tag Object per tag defined in the Operation Object instances.
 * see https://spec.openapis.org/oas/latest.html#tag-object
 */
export type TagObject = {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;

/**
 * Describes the structure of the OpenAPI Description format
 * see https://spec.openapis.org/oas/latest.html#schema-0
 */
export type Schema = {
  openapi: "3.1.1";
  info: InfoObject;
  /**
   * MUST be in the form of a URI.
   */
  jsonSchemaDialect?: string;
  servers?: ServerObject[];
  paths?: PathsObject;
  webhooks?: Record<string, PathItemObject>;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;
