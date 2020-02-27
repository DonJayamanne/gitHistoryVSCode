import { injectable } from 'inversify';
import { Disposable, workspace } from 'vscode';
import { ILogService } from './types';

@injectable()
export class Logger implements ILogService {
    private enabled = true;
    private traceEnabled = false;
    private disposable: Disposable;
    constructor() {
        this.updateEnabledFlag();
        this.disposable = workspace.onDidChangeConfiguration(() => this.updateEnabledFlag());
    }
    public dispose() {
        this.disposable.dispose();
    }
    public log(...args: any[]): void {
        if (!this.enabled) {
            return;
        }
        console.log(...args);
    }
    public error(...args: any[]): void {
        console.error(...args);
    }
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
        const logLevel = workspace.getConfiguration('gitHistory').get<string>('logLevel', 'None');
        this.traceEnabled = logLevel === 'Debug';
    }
}
