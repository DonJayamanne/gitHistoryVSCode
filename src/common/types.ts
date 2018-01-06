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
    selectFileCommitCommandAction(context: Context): Promise<ICommand | undefined>;
    selectCommitCommandAction(context: Context): Promise<ICommand | undefined>;
}

export type Context = {
    workspaceFolder: string;
    branch: string;
    hash: Hash;
    committedFile?: CommittedFile;
    logEntry?: LogEntry;
};

export interface ICommand {
    data: Context;
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
