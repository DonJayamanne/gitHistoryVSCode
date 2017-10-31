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

export interface IApiRouteHandler {
    getLogEntries(request: Request, response: Response): void;
    getBranches(request: Request, response: Response): void;
    getCommit(request: Request, response: Response): void;
    cherryPickCommit(request: Request, response: Response): void;
    doSomethingWithCommit(request: Request, response: Response): void;
    selectCommittedFile(request: Request, response: Response): void;
}

export type PortAndId = {
    port: number,
    id: string
};

export const IServerHost = Symbol('IServer');
export interface IServerHost extends Disposable {
    start(workspaceFolder: string): Promise<PortAndId>;
}

export type State = {
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

export const IStateStore = Symbol('IStateStore');

export interface IStateStore extends Disposable {
    initialize(workspaceFolder: string, branchName: string, branchSelection: BranchSelection): Promise<void>;
    updateEntries(workspaceFolder: string, entries: Promise<LogEntries>, pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: Uri, branchSelection?: BranchSelection): Promise<void>;
    updateLastHashCommit(workspaceFolder: string, hash: string, commit: Promise<LogEntry | undefined>): Promise<void>;
    clearLastHashCommit(workspaceFolder: string): Promise<void>;
    getState(workspaceFolder: string): Readonly<State> | undefined;
}
