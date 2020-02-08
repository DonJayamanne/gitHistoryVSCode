import { injectable } from 'inversify';
import { Disposable, workspace } from 'vscode';
import { ILogService } from './types';

@injectable()
export class Logger implements ILogService {
    private enabled: boolean = true;
    private traceEnabled: boolean = false;
    private disposable: Disposable;
    constructor() {
        this.updateEnabledFlag();
        this.disposable = workspace.onDidChangeConfiguration(() => this.updateEnabledFlag());
    }
    public dispose() {
        this.disposable.dispose();
    }
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        if (!this.enabled) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(...args);
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        // tslint:disable-next-line:no-console
        console.error(...args);
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        if (!this.enabled) {
            return;
        }
        if (!this.traceEnabled) {
            return;
        }
        console.warn(...args);
    }
    private updateEnabledFlag() {
        // tslint:disable-next-line:newline-per-chained-call
        const logLevel =  workspace.getConfiguration('gitHistory').get<string>('logLevel', 'None');
        this.traceEnabled = logLevel === 'Debug';
    }
}
