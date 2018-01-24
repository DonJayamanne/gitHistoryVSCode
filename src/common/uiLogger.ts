import { injectable } from 'inversify';
import { OutputChannel, workspace } from 'vscode';
import { getLogChannel } from '../logger';
import { ILogService } from './types';

@injectable()
export class OutputPanelLogger implements ILogService {
    private readonly outputChannel: OutputChannel;
    private readonly traceEnabled: boolean;
    constructor() {
        this.outputChannel = getLogChannel();
        const logLevel = workspace.getConfiguration('gitHistory').get<string>('logLevel');
        this.traceEnabled = (typeof logLevel === 'string' && logLevel.toUpperCase() === 'DEBUG');
    }
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
        this.outputChannel.show();
    }
    // tslint:disable-next-line:no-any
    public trace(...args: any[]): void {
        if (!this.traceEnabled) {
            return;
        }
        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
    }
    // tslint:disable-next-line:no-any
    public formatArgs(...args: any[]): string {
        return args.map(arg => {
            if (arg instanceof Error) {
                // tslint:disable-next-line:no-any
                const error: { [key: string]: any } = {};
                Object.getOwnPropertyNames(arg).forEach(key => {
                    error[key] = arg[key];
                });

                return JSON.stringify(error);
            } else if (arg !== null && arg !== undefined && typeof arg === 'object') {
                return JSON.stringify(arg);
            } else if (typeof arg === 'string' && arg.startsWith('--format=')) {
                return '--pretty=one-line';
            } else {
                return `${arg}`;
            }
        })
            .join(' ');
    }
}
