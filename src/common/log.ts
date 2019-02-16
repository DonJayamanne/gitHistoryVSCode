import { injectable } from 'inversify';
import { Disposable, workspace } from 'vscode';
import { ILogService } from './types';

@injectable()
export class Logger implements ILogService {
    private _enabled: boolean = false;
    private disposable: Disposable;
    private get enabled(): boolean {
        return this._enabled;
    }
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
        if (!this.enabled) {
            return;
        }
        console.error(...args);
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        if (!this.enabled) {
            return;
        }
        console.warn(...args);
    }
    private updateEnabledFlag() {
        this._enabled = workspace.getConfiguration('gitHistory').get<string>('logLevel', 'None') === 'Info';
    }
}
