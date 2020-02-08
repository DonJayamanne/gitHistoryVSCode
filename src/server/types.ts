import { Request, Response } from 'express';
import { Disposable } from 'vscode';

export const IApiRouteHandler = Symbol('IApiRouteHandler');

export interface IApiRouteHandler extends Disposable {
    getLogEntries(request: Request, response: Response): void;
    getBranches(request: Request, response: Response): void;
    getCommit(request: Request, response: Response): void;
    doAction(request: Request, response: Response): void;
    //doSomethingWithCommit(request: Request, response: Response): void;
    selectCommittedFile(request: Request, response: Response): void;
}

export type StartupInfo = {
    port: number;
};

export const IServerHost = Symbol('IServer');
export interface IServerHost extends Disposable {
    start(): Promise<StartupInfo>;
}
