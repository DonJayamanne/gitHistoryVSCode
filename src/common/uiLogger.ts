import { injectable } from 'inversify';
import { OutputChannel } from 'vscode';
import { getLogChannel } from '../logger';
import { ILogService } from './types';

@injectable()
export class OutputPanelLogger implements ILogService {
    private readonly outputChannel: OutputChannel;
    constructor() {
        this.outputChannel = getLogChannel();
    }
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        this.outputChannel.appendLine(args.join(' '));
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        this.outputChannel.appendLine(args.join(' '));
        this.outputChannel.show();
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        this.outputChannel.appendLine(args.join(' '));
    }
}
