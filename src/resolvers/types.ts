export type Context = {
  me: {
    uuid: string;
    email: string;
  };
  dataLoader: {
    initialized: boolean;
    loaders: {
      [key: string]: any;
    }
  }
};
