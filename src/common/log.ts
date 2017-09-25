import { injectable } from 'inversify';

export interface ILogService {
    // tslint:disable-next-line:no-any
    log(...args: any[]): void;
    // tslint:disable-next-line:no-any
    warn(...args: any[]): void;
    // tslint:disable-next-line:no-any
    error(...args: any[]): void;
}

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
    public warn(...args: any[]): void {
        console.warn(...args);
    }
}
