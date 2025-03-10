# Building block for Fetch API

This is a small, zero dependencies building block for creating HTTP clients based on native fetch api. It allows you to compose your fetch function easily.

## Installation

```sh
npm install @zemd/http-client
pnpm add @zemd/http-client
```

## Usage

```ts
import { compose, method, json } from "@zemd/http-client";

const myfetch = compose([method("POST"), json()], fetch);
// ^ myfetch is a `fetch` function with configured http method and Content-Type
const resp = await myfetch("https://example.com");
// ^ calling `myfetch` is the same as calling `fetch` with the same arguments
```

As you can see the configuration and usage are very simple and straightforward.

Some real-world examples you can find in `../apis/` folder.

A simple example you can also find here [src/example.ts](./src/example.ts)

## License

`@zemd/http-client` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
