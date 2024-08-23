# @zemd/http-client

This is a small, zero requirements and simple library for creating HTTP clients. It uses simple approach by
providing an api around native fetch(but can be overridden by setting your calling mechanism) in a configurable and functional manner.

## Installation

```sh
bun add @zemd/http-client
npm install @zemd/http-client
yarn install @zemd/http-client
pnpm add @zemd/http-client
```

## Usage

```ts
import { compose, method, json } from "@zemd/http-client";

const myfetch = compose([
  method("POST"),
  json(),
], fetch);

const resp = await myfetch("https://example.com");
```

As you can see the idea is very simple, and real power comes when you start composing different configurations
together and creating your client.

A real example you can find in `../apis/` folder.

An example of how you can use the library in your project see [src/example.ts](./src/example.ts)


## License

`@zemd/http-client` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)
