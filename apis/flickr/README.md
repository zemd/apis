# @zemd/flickr-rest-api

This is a Flickr API implementation for javascript projects.

## Installation

```sh
bun add @zemd/flickr-rest-api
npm install @zemd/flickr-rest-api
yarn add @zemd/flickr-rest-api
pnpm add @zemd/flickr-rest-api
```

## Usage

```ts
import { flickr } from "@zemd/flickr-rest-api";

const client = figma("your-flickr-token");
const response = await client.photosets.getPhotos({ ... params ... });
console.log(await response.json());
```

## Implemented API Methods

See documentation [https://www.flickr.com/services/api/](https://www.flickr.com/services/api/)

- [x] activity
- [ ] auth
- [ ] auth.oauth
- [ ] blogs
- [ ] cameras
- [ ] collections
- [ ] commons
- [ ] contacts
- [ ] favorites
- [ ] galleries
- [ ] groups.discuss.replies
- [ ] groups.discuss.topics
- [ ] groups
- [ ] groups.members
- [ ] groups.pools
- [ ] interestingness
- [ ] machinetags
- [ ] panda
- [ ] people
- [ ] photos
- [ ] photos.comments
- [ ] photos.geo
- [ ] photos.licenses
- [ ] photos.notes
- [ ] photos.people
- [ ] photos.suggestions
- [ ] photos.transform
- [ ] photos.upload
- [x] photosets
- [ ] photosets.comments
- [ ] places
- [ ] prefs
- [ ] profile
- [ ] push
- [ ] reflection
- [ ] stats
- [ ] tags
- [ ] test
- [ ] testimonials
- [ ] urls


## License

`@zemd/flickr-rest-api` released under the Apache 2.0 license

## Donate

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/static/v1?label=UNITED24&message=support%20Ukraine&color=blue)](https://u24.gov.ua/)

