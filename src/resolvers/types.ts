export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

export type Context = {
  me: {
    id: string;
    displayName: string;
    email: string;
    roles: Role[];
  };
  dataLoader: {
    initialized: boolean;
    loaders: {
      [key: string]: any;
    } & object;
  }
};
