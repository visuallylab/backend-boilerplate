
export interface ILogger {
  create(namespace: string): ILogger;
  error(...messages: string[]): void;
}

export class Logger implements ILogger {
  constructor(
    public readonly namespace: string = '',
    public readonly parent?: Logger | null,
  ) {}

  public create(namespace: string, divider = '/') {
    return new Logger(`${this.namespace}${divider}${namespace}`, this);
  }

  public error(...messages: string[]): void {
    // tslint:disable-next-line:no-console
    console.error(...messages);
  }
}
