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
    getWorkspaceFolder(): Promise<string | undefined>;
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

// tslint:disable-next-line:max-classes-per-file
export class FileCommitDetails extends CommitDetails {
    constructor(workspaceFolder: string, branch: string, logEntry: LogEntry, public readonly committedFile: Readonly<CommittedFile>) {
        super(workspaceFolder, branch, logEntry);
    }
}

export interface ICommand<T> {
    /**
     * Command name.
     */
    name: string;
    data: T;
    /**
     * A human readable string which is rendered prominent.
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
    preExecute?: () => boolean | Promise<boolean>;
    // tslint:disable-next-line:no-any
    execute(): void | Promise<any> | Thenable<any>;
}
