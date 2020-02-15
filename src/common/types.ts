// tslint:disable-next-line:max-classes-per-file
// tslint:disable:max-classes-per-file

import { Command } from 'vscode';
import { BranchSelection, CommittedFile, LogEntry } from '../types';

export const ILogService = Symbol('ILogService');

export interface ILogService {
    // tslint:disable-next-line:no-any
    log(...args: any[]): void;
    // tslint:disable-next-line:no-any
    trace(...args: any[]): void;
    // tslint:disable-next-line:no-any
    error(...args: any[]): void;
}

export const IUiService = Symbol('IUiService');

export interface IUiService {
    getBranchSelection(): Promise<BranchSelection | undefined>;
    selectFileCommitCommandAction(fileCommit: FileCommitDetails): Promise<ICommand<FileCommitDetails> | undefined>;
    selectCommitCommandAction(commit: CommitDetails): Promise<ICommand<CommitDetails> | undefined>;
}

export enum CallContextSource {
    viewer = 0,
    commandPalette = 1
}

export class CallContext<T> {
    constructor(public readonly source: CallContextSource, public readonly data: T) {

    }
}

export class BranchDetails {
    constructor(public readonly workspaceFolder: string,
        public readonly branch: string) { }
}

export class CommitDetails extends BranchDetails {
    constructor(workspaceFolder: string, branch: string, public readonly logEntry: Readonly<LogEntry>) {
        super(workspaceFolder, branch);
    }
}

export class CompareCommitDetails extends CommitDetails {
    constructor(leftCommit: CommitDetails, public readonly rightCommit: CommitDetails, public readonly committedFiles: CommittedFile[]) {
        super(leftCommit.workspaceFolder, leftCommit.branch, leftCommit.logEntry);
    }
}

// tslint:disable-next-line:max-classes-per-file
export class FileCommitDetails extends CommitDetails {
    constructor(workspaceFolder: string, branch: string, logEntry: LogEntry, public readonly committedFile: Readonly<CommittedFile>) {
        super(workspaceFolder, branch, logEntry);
    }
}

export class CompareFileCommitDetails extends FileCommitDetails {
    constructor(leftCommit: CommitDetails, public readonly rightCommit: CommitDetails, public readonly committedFile: Readonly<CommittedFile>) {
        super(leftCommit.workspaceFolder, leftCommit.branch, leftCommit.logEntry, committedFile);
    }
}

export interface ICommand<T> extends Command {
    data: T;
    /**
     * Title of the command, like `save`.
     */
    label: string;
    /**
     * A human readable string which is rendered less prominent.
     */
    description: string;
    /**
     * A human readable string which is rendered less prominent.
     */
    detail?: string;
    // tslint:disable-next-line:prefer-method-signature
    preExecute(): Promise<boolean>;
    // tslint:disable-next-line:no-any
    execute(): void | Promise<any> | Thenable<any>;
}
