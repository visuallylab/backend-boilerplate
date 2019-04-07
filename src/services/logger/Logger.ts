import { DEVELOPMENT } from '@/environment';

export enum LogLevel {
  Info = 'INFO',
  Warning = 'WARNING',
  Error = 'ERROR',
  Debug = 'DEBUG',
}

export type LogMessage = {
  level: LogLevel;
  messages: any[];
  namespace: string;
  timestamp: number;
};

export interface ILogSender {
  send(logMessage: LogMessage): void;
}

export interface ILogger {
  create(namespace: string, divider?: string): ILogger;
  log(type: LogLevel, ...messages: any[]): void;
  info(...messages: any[]): void;
  warning(...messages: any[]): void;
  error(...messages: any[]): void;
  debug(...messages: any[]): void;
}

export class Logger implements ILogger {
  private senders: ILogSender[] = [];
  constructor(
    public readonly namespace: string = '',
    public readonly parent?: Logger | null,
  ) {}

  public create(namespace: string, divider = '/') {
    return new Logger(`${this.namespace}${divider}${namespace}`, this);
  }

  public log(level: LogLevel, ...messages: any[]) {
    // only emit debug level in development
    if (!DEVELOPMENT && level === LogLevel.Debug) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      messages,
      namespace: this.namespace,
      timestamp: Date.now(),
    };

    this.send(logMessage);
  }

  public info(...messages: any[]): void {
    this.log(LogLevel.Info, ...messages);
  }

  public warning(...messages: any[]): void {
    this.log(LogLevel.Warning, ...messages);
  }

  public error(...messages: any[]): void {
    this.log(LogLevel.Error, ...messages);
  }

  public debug(...messages: any[]): void {
    this.log(LogLevel.Debug, ...messages);
  }

  public applySender(sender: ILogSender): void {
    this.senders.push(sender);
  }

  private send(logMessage: LogMessage) {
    // resolve parent before, we always expect high level log printed first.
    if (this.parent) {
      this.parent.send(logMessage);
    }

    if (this.senders.length > 0) {
      this.senders.forEach(sender => sender.send(logMessage));
    }
  }
}
