
import { DEVELOPMENT } from '@/environment';

export enum LogLevel {
  Info = 'INFO',
  Warning = 'WARNING',
  Error = 'ERROR',
  Debug = 'DEBUG',
}

export interface ILogSender {
  send(...logMessage: string[]): void;
}

export interface ILogger {
  create(namespace: string, divider?: string): ILogger;
  log(type: LogLevel, ...messages: string[]): void;
  info(...messages: string[]): void;
  warning(...messages: string[]): void;
  error(...messages: string[]): void;
  debug(...messages: string[]): void;
}

// TODO:
// implement stdout sender
// LogMessage interface

export class Logger implements ILogger {
  private senders: ILogSender[] = [];
  constructor(
    public readonly namespace: string = '',
    public readonly parent?: Logger | null,
  ) {}

  public create(namespace: string, divider = '/') {
    return new Logger(`${this.namespace}${divider}${namespace}`, this);
  }

  public log(logLevel: LogLevel, ...messages: string[]) {
    // only emit debug level in development
    if (!DEVELOPMENT && logLevel === LogLevel.Debug) {
      return;
    }

    // resolve parent before, we always expect high level log printed first.
    if (this.parent) {
      this.parent.send(logLevel, messages);
    }
  }

  public info(...messages: string[]): void {
    this.log(LogLevel.Info, ...messages);
  }

  public warning(...messages: string[]): void {
    this.log(LogLevel.Warning, ...messages);
  }

  public error(...messages: string[]): void {
    this.log(LogLevel.Error, ...messages);
  }

  public debug(...messages: string[]): void {
    this.log(LogLevel.Debug, ...messages);
  }

  public applySender(sender: ILogSender): void {
    this.senders.push(sender);
  }

  private send(logLevel: LogLevel, message: string[]) {
    // tslint:disable-next-line:no-console
    console.log(`[${logLevel}] `, ...message);
  }
}
