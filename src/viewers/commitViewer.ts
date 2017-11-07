import { inject, injectable } from 'inversify';
import { OutputChannel } from 'vscode';
import { ICommitViewFormatter } from '../formatters/types';
import { IOutputChannel, LogEntry } from '../types';
import { ICommitViewer } from './types';

@injectable()
export class CommitViewer implements ICommitViewer {
    constructor( @inject(IOutputChannel) private outputChannel: OutputChannel, @inject(ICommitViewFormatter) private commitFormatter: ICommitViewFormatter) { }
    public showCommit(logEntry: LogEntry): void {
        const output = this.commitFormatter.format(logEntry);
        this.outputChannel.appendLine(output);
        this.outputChannel.show();
    }
}
