import * as moment from 'moment';
import { ILogSender, LogMessage } from '../Logger';

export default class StdoutSender implements ILogSender {

  public send(logMessage: LogMessage): void {
    const data = this.format(logMessage);
    process.stdout.write(data);
    process.stdout.write('\n');
  }

  private format(logMessage: LogMessage): string {
    const messages = logMessage.messages.map(value => String(value));
    const formatedTime = moment(logMessage.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSS');
    return `[${logMessage.level}] ${messages.join(', ')} (${formatedTime})`;
  }
}
