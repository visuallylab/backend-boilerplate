enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}

export type Context = {
  me: {
    uuid: string;
    displayName: string;
    email: string;
    roles: Role[];
  };
  dataLoader: {
    initialized: boolean;
    loaders: {
      [key: string]: any;
    }
  }
};
