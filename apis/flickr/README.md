# @zemd/flickr-rest-api

This is a Flickr API implementation for javascript projects.

## Installation

```sh
bun install @zemd/flickr-rest-api
npm install @zemd/flickr-rest-api
yarn install @zemd/flickr-rest-api
pnpm install @zemd/flickr-rest-api
```

## Usage

```ts
import { flickr } from "@zemd/flickr-rest-api";

const client = figma("your-flickr-token");
const response = await client.photosets.getPhotos({ ... params ... });
console.log(await response.json());
```

## License

`@zemd/flickr-rest-api` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)

