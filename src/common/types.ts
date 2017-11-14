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
    selectFileCommitCommandAction(commitedFile: CommittedFile): Promise<string | undefined>;
    selectCommitCommandAction(workspaceFolder: string, logEntry: LogEntry): Promise<ICommand | undefined>;
}

export interface ICommand {
    readonly command: string;
    // tslint:disable-next-line:no-any
    readonly args: any[];
}
