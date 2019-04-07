# Backend boilerplate

>Easy initialize backend server with apollo-server-koa, graphql, koa


## Environment Setup

* Linux/macOS
* git
* node >= 10.15.0
* yarn >= 1.9.4

## What's inside

### main
* graphql
* type-graphql
* apollo-server-koa
* dataloader
* koa
* koa-router
* koa-bodyparser
* pg (postgress)
* typedi
* typeorm
* typeorm-typedi-extensions

### others
* jsonwebtoken
* aws-sdk
* jest
* bcrypt
* husky
* lint-staged
* dotenv
* ip
* yargs
* lodash
* moment
* lodash
* nodemon
* prettier

## Getting Started

After cloning, replace `.env.example` to `.env` and configure environment.

```sh
yarn
yarn start
```

Head to [localhost:8081/graphql](http://localhost:8081/graphql) to see the graphql playground.

### Other scripts

```sh
# run app in watch mode
yarn start:watch

# run app in debug mode that open logs from apollo response and typeorm
yarn start:debug

# run production app(./build/app.js)
yarn start:prod

# run unit tests also with tslint
yarn test

# run unit tests in watch mode
yarn test:watch
```

## File structure

```
backend-boilerplate/
├── src/
│   ├── entities/
│   ├── server/
│   │   ├── ApolloServerKoa.ts
│   │   └── KoaServer.ts
│   ├── resolvers/
│   ├── service/
│   │   ├── logger/
│   │   │   ├── senders/
│   │   │   └── Logger.ts
│   │   ├── storage/
│   │   ├── DB.ts
│   │   │   └── Pgsql.ts
│   │   ├── JwtService.ts
|   |   └── S3Service.ts
│   ├── tests/
│   ├── typings/
│   ├── environment.ts
│   ├── di.ts
|   └── app.ts
```

* `src/entities`: *Typeorm entities* which also connect *graphql* types or cross-container reusable *class-types*.
* `src/resolvers`: *Type-graphql resolvers* which implements almost api logic here.
* `src/server`: Server folder which includes http-server and apollo-server.
* `src/service`: Services which are connect to the outside world and perform most of the side-effects tasks. e.g. API client, third party integrations.
* `src/environment.ts`: Runtime environment
* `src/di.ts`: Dependency injection initialize.