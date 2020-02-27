import { injectable } from 'inversify';
import { Disposable, OutputChannel, workspace } from 'vscode';
import { getLogChannel } from '../logger';
import { ILogService } from './types';

@injectable()
export class OutputPanelLogger implements ILogService {
    private readonly outputChannel: OutputChannel;
    private enabled: boolean;
    private traceEnabled: boolean;
    private disposable: Disposable;
    constructor() {
        this.outputChannel = getLogChannel();
        this.enabled = false;
        this.traceEnabled = false;

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

        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
    }
    public error(...args: any[]): void {
        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
        this.outputChannel.show();
    }
    public trace(...args: any[]): void {
        if (!this.traceEnabled) {
            return;
        }
        const formattedText = this.formatArgs(...args);
        this.outputChannel.appendLine(formattedText);
    }
    public formatArgs(...args: any[]): string {
        return args
            .map(arg => {
                if (arg instanceof Error) {
                    const error: { [key: string]: any } = {};
                    Object.getOwnPropertyNames(arg).forEach(key => {
                        error[key] = arg[key];
                    });

                    return JSON.stringify(error);
                } else if (arg !== null && arg !== undefined && typeof arg === 'object') {
                    return JSON.stringify(arg);
                } else if (typeof arg === 'string' && arg.startsWith('--format=')) {
                    return '--pretty=oneline';
                } else {
                    return `${arg}`;
                }
            })
            .join(' ');
    }

    private updateEnabledFlag() {
        const logLevel = workspace.getConfiguration('gitHistory').get<string>('logLevel', 'None');
        this.enabled = logLevel !== 'None';
        this.traceEnabled = logLevel === 'Debug';
    }
}
