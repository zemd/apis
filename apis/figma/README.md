# @zemd/figma-rest-api

This is a Figma API implementation for javascript projects.

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
const response = await client.files.getFile("filekey");
console.log(await response.json());
```

## Advanced usage

There might be cases when the library was not updated to the latest version of the Figma API, or you want to use
some experimental features. In this case, you can construct your own api call using the essentials of the library.

Since the library is built on top of `@zemd/http-client` you can compose different configurations together.

## License

`@zemd/figma-rest-api` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
