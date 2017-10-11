import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { CommittedFile } from '../types';
import { IGitService, IGitServiceFactory } from '../types';
import { IApiRouteHandler } from './types';
// tslint:disable-next-line:no-require-imports no-var-requires
const shorthash = require('shorthash');

@injectable()
export class ApiController implements IApiRouteHandler {
    constructor(private app: Express, private gitServiceFactory: IGitServiceFactory) {
        this.app.get('/log', this.getLogEntries);
        this.app.get('/branches', this.getBranches);
        this.app.get('/log/:hash', this.getCommit);
        this.app.post('/log/:hash', this.selectCommit);
        this.app.post('/log/:hash/committedFile', this.selectCommittedFile);
        this.app.post('/log/:hash/cherryPick', this.cherryPickCommit);
    }

    private workspaceFolders: Map<string, string> = new Map<string, string>();
    public registerWorkspaceFolder(workspaceFolder: string) {
        const id: string = shorthash.unique(workspaceFolder);
        this.workspaceFolders.set(id, workspaceFolder);
        return id;
    }
    private getRepository(id: string): IGitService {
        const workspaceFolder = this.workspaceFolders.get(id)!;
        return this.gitServiceFactory.createGitService(workspaceFolder);
    }
    public getLogEntries = (request: Request, response: Response) => {
        const searchText = request.query.searchText;
        const pageIndex: number | undefined = request.query.pageIndex;
        const branch = request.query.branch;
        const pageSize: number | undefined = request.query.pageSize;

        this.getRepository(request.query.id)
            .getLogEntries(pageIndex, pageSize, branch, searchText)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getBranches = (request: Request, response: Response) => {
        this.getRepository(request.query.id)
            .getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getCommit = (request: Request, response: Response) => {
        this.getRepository(request.query.id).getCommit(request.params.hash)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public cherryPickCommit = (request: Request, response: Response) => {
        // tslint:disable-next-line:no-console
        console.log(request.params.hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    public selectCommit = (request: Request, response: Response) => {
        // tslint:disable-next-line:no-console
        console.log(request.params.hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    public selectCommittedFile = (request: Request, response: Response) => {
        // tslint:disable-next-line:prefer-type-cast
        const committedFile = request.body as CommittedFile;
        // tslint:disable-next-line:no-console
        console.log(committedFile);
    }
}
