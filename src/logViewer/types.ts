import { Request, Response } from 'express';
import { Disposable } from 'vscode';

export const ILogViewer = Symbol('ILogViewer');
// tslint:disable-next-line:no-empty-interface
export interface ILogViewer extends Disposable {

}

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
