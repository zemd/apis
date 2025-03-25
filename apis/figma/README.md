# Figma REST API client

The lightweight (4kB only not compressed) fetch-based and type-safe Figma Rest API client.

The package also re-distributes Figma OpenAPI declaration file in JSON format, since original `@figma/rest-api-spec` provides it only in YAML, which requires adding additional dependency.

The client is built using `@zemd/http-client` library, which is very simple `fetch` configurator.

## Installation

```sh
npm install @zemd/figma-rest-api
pnpm add @zemd/figma-rest-api
```

## Usage

```ts
import { figma, figmaToken, header } from "@zemd/figma-rest-api";

const client = figma([figmaToken("your-figma-token")]);
// alternatively you can use figma([header("Authorization", "Bearer <TOKEN>")]);
const response = await client.v1.files.getFile("filekey");
console.log(response);
```

## License

`@zemd/figma-rest-api` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
