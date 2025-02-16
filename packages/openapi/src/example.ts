import { builder, buildLicense, buildPathsObject, buildServerObject } from "./builders";
import type {
  PathItemObject,
  InfoObject,
  PathsObject,
  Schema,
  ServerObject,
  OperationObject,
  TagObject,
} from "./types";

const tags: TagObject[] = [
  {
    name: "pet",
    description: "Everything about your Pets",
    externalDocs: {
      description: "Find out more",
      url: "http://swagger.io",
    },
  },
  {
    name: "store",
    description: "Access to Petstore orders",
    externalDocs: {
      description: "Find out more about our store",
      url: "http://swagger.io",
    },
  },
  {
    name: "user",
    description: "Operations about user",
  },
];

const info = builder<InfoObject>({
  title: "Swagger Petstore",
  version: "1.0.19",
})
  .set("contact", {
    email: "apiteam@swagger.io",
  })
  .set(
    "description",
    "The Smartylighting Streetlights API allows you to remotely manage the city lights.\n\n### Check out its awesome features:\n\n* Turn a specific streetlight on/off 🌃\n* Dim a specific streetlight 😎\n* Receive real-time information about environmental lighting conditions 📈\n",
  )
  .set("license", buildLicense("Apache-2.0"));

const server = builder<ServerObject>({
  url: "https://petstore.swagger.io/v1/{pathName}",
});

const petPutOperation = builder<OperationObject>({})
  .set("tags", ["pet"])
  .set("summary", "Update an existing pet")
  .set("description", "Update an existing pet by Id")
  .set("operationId", "updatePet")
  .set("requestBody", {
    description: "Update an existent pet in the store",
    required: true,
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
      "application/xml": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
      "application/x-www-form-urlencoded": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
    },
  })
  .set("responses", {
    200: {
      description: "Successful operation",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Pet",
          },
        },
        "application/xml": {
          schema: {
            $ref: "#/components/schemas/Pet",
          },
        },
      },
    },
    400: {
      description: "Invalid ID supplied",
    },
    404: {
      description: "Pet not found",
    },
    422: {
      description: "Validation exception",
    },
  })
  .set("security", [
    {
      petstore_auth: ["write:pets", "read:pets"],
    },
  ]);

const petPostOperation = builder<OperationObject>({})
  .set("tags", ["pet"])
  .set("summary", "Add a new pet to the store")
  .set("description", "Add a new pet to the store")
  .set("operationId", "addPet")
  .set("requestBody", {
    description: "Create a new pet in the store",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
      "application/xml": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
      "application/x-www-form-urlencoded": {
        schema: {
          $ref: "#/components/schemas/Pet",
        },
      },
    },
    required: true,
  })
  .set("responses", {
    "200": {
      description: "Successful operation",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Pet",
          },
        },
        "application/xml": {
          schema: {
            $ref: "#/components/schemas/Pet",
          },
        },
      },
    },
    "400": {
      description: "Invalid input",
    },
    "422": {
      description: "Validation exception",
    },
  })
  .set("security", [
    {
      petstore_auth: ["write:pets", "read:pets"],
    },
  ]);

const paths = builder<PathsObject>({
  "/pet": builder<PathItemObject>({}).set("put", petPutOperation).set("post", petPostOperation),
  ...buildPathsObject("/pet/{petId}", {
    parameters: {
      petId: {
        in: "path",
        description: "ID of pet to return",
        required: true,
        schema: {
          type: "integer",
          format: "int64",
        },
      },
    },
    get: builder<OperationObject>({})
      .set("tags", ["pet"])
      .set("summary", "Find pet by ID")
      .set("description", "Returns a single pet")
      .set("operationId", "getPetById")
      .set("responses", {
        "200": {
          description: "successful operation",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Pet",
              },
            },
            "application/xml": {
              schema: {
                $ref: "#/components/schemas/Pet",
              },
            },
          },
        },
        "400": {
          description: "Invalid ID supplied",
        },
        "404": {
          description: "Pet not found",
        },
      })
      .set("security", [
        {
          api_key: [],
        },
        {
          petstore_auth: ["write:pets", "read:pets"],
        },
      ])
      .set("parameters", [
        {
          name: "petId",
          in: "path",
          description: "ID of pet to return",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
        },
      ]),
    post: builder<OperationObject>({})
      .set("tags", ["pet"])
      .set("summary", "Updates a pet in the store with form data")
      .set("operationId", "updatePetWithForm")
      .set("parameters", [
        {
          name: "petId",
          in: "path",
          description: "ID of pet that needs to be updated",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
        },
        {
          name: "name",
          in: "query",
          description: "Name of pet that needs to be updated",
          schema: {
            type: "string",
          },
        },
        {
          name: "status",
          in: "query",
          description: "Status of pet that needs to be updated",
          schema: {
            type: "string",
          },
        },
      ])
      .set("responses", {
        "400": {
          description: "Invalid input",
        },
      })
      .set("security", [
        {
          petstore_auth: ["write:pets", "read:pets"],
        },
      ]),
  }),
});

const schema = builder<Schema>({
  openapi: "3.1.1",
  info,
})
  .set("externalDocs", {
    description: "Find out more about Swagger",
    url: "http://swagger.io",
  })
  .set("servers", [
    server,
    buildServerObject("https://petstore3.swagger.io/api/v3", {}),
    buildServerObject(
      "https://petstore.swagger.io/{version}:{port}",
      {
        port: "8080",
        version: {
          default: "v1",
          description: "API version",
        },
      },
      { "x-foo": "bar" },
    ),
  ])
  .set("tags", tags)
  .set("paths", paths)
  .set("components", {
    schemas: {
      Order: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            examples: [10],
          },
          petId: {
            type: "integer",
            format: "int64",
            examples: [198_772],
          },
          quantity: {
            type: "integer",
            format: "int32",
            examples: [7],
          },
          shipDate: {
            type: "string",
            format: "date-time",
          },
          status: {
            type: "string",
            description: "Order Status",
            examples: ["approved"],
            enum: ["placed", "approved", "delivered"],
          },
          complete: {
            type: "boolean",
          },
        },
        xml: {
          name: "order",
        },
      },
      Customer: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            examples: [100_000],
          },
          username: {
            type: "string",
            examples: ["fehguy"],
          },
          address: {
            type: "array",
            xml: {
              name: "addresses",
              wrapped: true,
            },
            items: {
              $ref: "#/components/schemas/Address",
            },
          },
        },
        xml: {
          name: "customer",
        },
      },
      Address: {
        type: "object",
        properties: {
          street: {
            type: "string",
            examples: ["437 Lytton"],
          },
          city: {
            type: "string",
            examples: ["Palo Alto"],
          },
          state: {
            type: "string",
            examples: ["CA"],
          },
          zip: {
            type: "string",
            examples: ["94301"],
          },
        },
        xml: {
          name: "address",
        },
      },
      Category: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            examples: [1],
          },
          name: {
            type: "string",
            examples: ["Dogs"],
          },
        },
        xml: {
          name: "category",
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            examples: [10],
          },
          username: {
            type: "string",
            examples: ["theUser"],
          },
          firstName: {
            type: "string",
            examples: ["John"],
          },
          lastName: {
            type: "string",
            examples: ["James"],
          },
          email: {
            type: "string",
            examples: ["john@email.com"],
          },
          password: {
            type: "string",
            examples: ["12345"],
          },
          phone: {
            type: "string",
            examples: ["12345"],
          },
          userStatus: {
            type: "integer",
            description: "User Status",
            format: "int32",
            examples: [1],
          },
        },
        xml: {
          name: "user",
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
          },
          name: {
            type: "string",
          },
        },
        xml: {
          name: "tag",
        },
      },
      Pet: {
        required: ["name", "photoUrls"],
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            examples: [10],
          },
          name: {
            type: "string",
            examples: ["doggie"],
          },
          category: {
            $ref: "#/components/schemas/Category",
          },
          photoUrls: {
            type: "array",
            xml: {
              wrapped: true,
            },
            items: {
              type: "string",
              xml: {
                name: "photoUrl",
              },
            },
          },
          tags: {
            type: "array",
            xml: {
              wrapped: true,
            },
            items: {
              $ref: "#/components/schemas/Tag",
            },
          },
          status: {
            type: "string",
            description: "pet status in the store",
            enum: ["available", "pending", "sold"],
          },
        },
        xml: {
          name: "pet",
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          code: {
            type: "integer",
            format: "int32",
          },
          type: {
            type: "string",
          },
          message: {
            type: "string",
          },
        },
        xml: {
          name: "##default",
        },
      },
    },
    requestBodies: {
      Pet: {
        description: "Pet object that needs to be added to the store",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Pet",
            },
          },
          "application/xml": {
            schema: {
              $ref: "#/components/schemas/Pet",
            },
          },
        },
      },
      UserArray: {
        description: "List of user object",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/User",
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      petstore_auth: {
        type: "oauth2",
        flows: {
          implicit: {
            authorizationUrl: "https://petstore3.swagger.io/oauth/authorize",
            scopes: {
              "write:pets": "modify pets in your account",
              "read:pets": "read your pets",
            },
          },
        },
      },
      api_key: {
        type: "apiKey",
        name: "api_key",
        in: "header",
      },
    },
  });

console.log(JSON.stringify(schema, null, 2));
