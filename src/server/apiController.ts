import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { commands, Uri } from 'vscode';
import { BranchSelection, CommittedFile, IGitService, IGitServiceFactory, LogEntries, LogEntriesResponse, LogEntry } from '../types';
import { IApiRouteHandler, IWorkspaceQueryStateStore } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires

@injectable()
export class ApiController implements IApiRouteHandler {
    constructor(private app: Express,
        private gitServiceFactory: IGitServiceFactory,
        private stateStore: IWorkspaceQueryStateStore) {

        this.app.get('/log', this.getLogEntries);
        this.app.get('/branches', this.getBranches);
        this.app.get('/log/:hash', this.getCommit);
        this.app.post('/log/clearSelection', this.clearSelectedCommit);
        this.app.post('/log/:hash/doSomething', this.doSomethingWithCommit);
        this.app.post('/log/:hash/committedFile', this.selectCommittedFile);
        this.app.post('/log/:hash/cherryPick', this.cherryPickCommit);
    }

    private getWorkspace(id: string) {
        return this.stateStore.getState(id)!.workspaceFolder;
    }
    private getRepository(id: string): IGitService {
        const workspaceFolder = this.getWorkspace(id);
        return this.gitServiceFactory.createGitService(workspaceFolder);
    }
    // tslint:disable-next-line:no-empty
    public dispose() { }
    // tslint:disable-next-line:cyclomatic-complexity
    public getLogEntries = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        const searchText = request.query.searchText;
        const pageIndex: number | undefined = request.query.pageIndex ? parseInt(request.query.pageIndex, 10) : undefined;
        const branch = request.query.branch;
        const pageSize: number | undefined = request.query.pageSize ? parseInt(request.query.pageSize, 10) : undefined;
        const filePath: string | undefined = request.query.file;
        const file = filePath ? Uri.file(filePath) : undefined;
        const branchSelection = request.query.pageSize ? parseInt(request.query.branchSelection, 10) as BranchSelection : undefined;

        let promise: Promise<LogEntries>;
        const currentState = this.stateStore.getState(id);

        const branchesMatch = currentState && (typeof currentState.branch === 'string' && typeof branch === 'string' && currentState.branch === branch);
        const noBranchDefinedByClient = !currentState;
        if (searchText === undefined && pageIndex === undefined && pageSize === undefined &&
            filePath === undefined && file === undefined &&
            currentState && currentState.entries && (branchesMatch || noBranchDefinedByClient)) {

            let selected: LogEntry | undefined;
            if (currentState.lastFetchedCommit) {
                selected = await currentState.lastFetchedCommit;
            }
            promise = currentState.entries.then(data => {
                // tslint:disable-next-line:no-unnecessary-local-variable
                const entriesResponse: LogEntriesResponse = {
                    ...data,
                    branch: currentState.branch,
                    branchSelection: currentState.branchSelection,
                    file: currentState.file,
                    pageIndex: currentState.pageIndex,
                    pageSize: currentState.pageSize,
                    searchText: currentState.searchText,
                    selected: selected
                };
                return entriesResponse;
            });
        } else if (currentState &&
            currentState.searchText === searchText &&
            currentState.pageIndex === pageIndex &&
            currentState.branch === branch &&
            currentState.pageSize === pageSize &&
            currentState.file === file &&
            currentState.entries) {

            promise = currentState.entries;
        }
        else {
            promise = this.getRepository(decodeURIComponent(request.query.id))
                .getLogEntries(pageIndex, pageSize, branch, searchText)
                .then(data => {
                    // tslint:disable-next-line:no-unnecessary-local-variable
                    const entriesResponse: LogEntriesResponse = {
                        ...data,
                        branch,
                        branchSelection,
                        file,
                        pageIndex,
                        pageSize,
                        searchText,
                        selected: undefined
                    };
                    return entriesResponse;
                });
            this.stateStore.updateEntries(id, promise,
                pageIndex, pageSize, branch, searchText, file, branchSelection);
        }

        promise
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getBranches = (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        this.getRepository(id)
            .getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getCommit = (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        const hash: string = request.params.hash;

        const currentState = this.stateStore.getState(id);
        let commitPromise: Promise<LogEntry | undefined>;
        // tslint:disable-next-line:possible-timing-attack
        if (currentState && currentState.lastFetchedHash === hash && currentState.lastFetchedCommit) {
            commitPromise = currentState.lastFetchedCommit;
        }
        else {
            commitPromise = this.getRepository(id).getCommit(hash);
            this.stateStore.updateLastHashCommit(id, hash, commitPromise);
        }

        commitPromise
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public cherryPickCommit = (request: Request, response: Response) => {
        // const id: string = decodeURIComponent(request.query.id);
        const hash: string = request.params.hash;
        // tslint:disable-next-line:no-console
        console.log(hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    public clearSelectedCommit = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);

        const workspaceFolder = this.getWorkspace(id);
        await this.stateStore.clearLastHashCommit(workspaceFolder);
        response.send('');
    }
    public doSomethingWithCommit = (request: Request, response: Response) => {
        // const id: string = decodeURIComponent(request.query.id);
        // const hash: string = request.params.hash;
        response.send('');
    }
    public selectCommittedFile = (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        const hash: string = request.params.hash;
        // tslint:disable-next-line:prefer-type-cast
        const committedFile = request.body as CommittedFile;
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(id)!;
        commands.executeCommand('git.commit.file.select', workspaceFolder, currentState.branch, hash, committedFile);
    }
}
