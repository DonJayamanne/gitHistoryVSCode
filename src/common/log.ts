import { injectable } from 'inversify';
import { ILogService } from './types';

@injectable()
export class Logger implements ILogService {
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        // tslint:disable-next-line:no-console
        console.log(...args);
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        console.error(...args);
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        console.warn(...args);
    }
}
