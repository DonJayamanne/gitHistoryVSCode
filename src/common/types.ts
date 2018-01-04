import { BranchSelection, CommittedFile, Hash, LogEntry } from '../types';

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
    selectFileCommitCommandAction(workspaceFolder: string, branch: string | undefined, hash: Hash, committedFile: CommittedFile): Promise<ICommand | undefined>;
    selectCommitCommandAction(workspaceFolder: string, logEntry: LogEntry): Promise<ICommand | undefined>;
}

export interface ICommand {
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
