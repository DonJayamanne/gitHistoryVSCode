import { Request, Response } from 'express';
import { Disposable } from 'vscode';

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
    selectCommit(request: Request, response: Response): void;
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
