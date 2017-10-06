import { injectable } from 'inversify';
import { ILogService } from '../src/common/log';

@injectable()
export class MockLogger implements ILogService {
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        return;
    }
}
