import { Request, Response } from 'express';
import { Disposable, Uri } from 'vscode';
import { BranchSelection, LogEntries, LogEntry } from '../types';

export type ThemeDetails = {
    theme: string,
    backgroundColor: string,
    color: string,
    fontFamily: string,
    fontSize: string,
    fontWeight?: string
};
export const IThemeService = Symbol('IThemeService');

export interface IThemeService {
    getThemeDetails(theme: string, backgroundColor: string, color: string): ThemeDetails;
}
export const IApiRouteHandler = Symbol('IApiRouteHandler');

export interface IApiRouteHandler extends Disposable {
    getLogEntries(request: Request, response: Response): void;
    getBranches(request: Request, response: Response): void;
    getCommit(request: Request, response: Response): void;
    doSomethingWithCommit(request: Request, response: Response): void;
    selectCommittedFile(request: Request, response: Response): void;
}

export type StartupInfo = {
    port: number
};

export const IServerHost = Symbol('IServer');
export interface IServerHost extends Disposable {
    start(workspaceFolder: string): Promise<StartupInfo>;
}

export type State = {
    workspaceFolder: string;
    pageIndex?: number;
    pageSize?: number;
    branch?: string;
    searchText?: string;
    file?: Uri;
    entries?: Promise<LogEntries>;
    lastFetchedHash?: string;
    lastFetchedCommit?: Promise<LogEntry | undefined>;
    branchSelection?: BranchSelection
};

export const IWorkspaceQueryStateStore = Symbol('IWorkspaceQueryStateStore');

export interface IWorkspaceQueryStateStore extends Disposable {
    initialize(id: string, workspaceFolder: string, branchName: string, branchSelection: BranchSelection): Promise<void>;
    updateEntries(id: string, entries: Promise<LogEntries>, pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: Uri, branchSelection?: BranchSelection): Promise<void>;
    updateLastHashCommit(id: string, hash: string, commit: Promise<LogEntry | undefined>): Promise<void>;
    clearLastHashCommit(id: string): Promise<void>;
    getState(id: string): Readonly<State> | undefined;
}
