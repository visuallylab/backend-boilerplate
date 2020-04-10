import * as dayjs from 'dayjs';
import { DEBUG } from '@/environments';
import { ILogSender, LogMessage } from '../Logger';

export default class StdoutSender implements ILogSender {
  public send(logMessage: LogMessage): void {
    const data = this.format(logMessage);
    process.stdout.write(data);
    process.stdout.write('\n');
  }

  private format(logMessage: LogMessage): string {
    const messages = logMessage.messages.map((value) => String(value));
    const formatedTime = dayjs(logMessage.timestamp).format(
      'YYYY-MM-DDTHH:mm:ss.SSS',
    );
    return `[${logMessage.level}]${
      DEBUG ? ` (${logMessage.namespace})` : ''
    } ${messages.join(', ')} (${formatedTime})`;
  }
}
