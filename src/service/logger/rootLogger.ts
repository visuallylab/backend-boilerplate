import { DEVELOPMENT } from '@/environment';
import StdoutSender from './senders/StdoutSender';
import { ILogger, Logger } from './Logger';

export function rootLogger(): ILogger {
  const logger = new Logger('root');

  if (DEVELOPMENT) {
    logger.applySender(new StdoutSender());
  }

  return logger;
}

export default rootLogger();
