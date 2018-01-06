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
    selectFileCommitCommandAction(context: FileCommitContext): Promise<ICommand<FileCommitContext> | undefined>;
    selectCommitCommandAction(context: CommitContext): Promise<ICommand<CommitContext> | undefined>;
}

export class BranchContext {
    constructor(public readonly workspaceFolder: string,
        public readonly branch: string) { }
}

export class CommitContext extends BranchContext {
    constructor(workspaceFolder: string, branch: string, public readonly logEntry: Readonly<LogEntry>) {
        super(workspaceFolder, branch);
    }
}

export class FileCommitContext extends CommitContext {
    constructor(workspaceFolder: string, branch: string, logEntry: LogEntry, public readonly committedFile: Readonly<CommittedFile>) {
        super(workspaceFolder, branch, logEntry);
    }
}

export interface ICommand<T> {
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
