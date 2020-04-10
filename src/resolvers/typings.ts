import * as Koa from 'koa';
import { ObjectType, Field } from 'type-graphql';

export type Context = {
  me: {
    id: string;
    displayName: string;
    email: string;
  };
  koaContext: Koa.Context;
  dataLoader: {
    initialized: boolean;
    loaders: {
      [key: string]: any;
    } & object;
  };
};

export type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
};

@ObjectType()
export class SimpleResponseOutput {
  @Field()
  public success: boolean;
}
