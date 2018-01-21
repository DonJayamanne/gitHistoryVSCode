import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { IFileStatParser } from '../adapter/parsers/types';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CommitDetails, FileCommitDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, CommittedFile, IGitService, IGitServiceFactory, LogEntries, LogEntriesResponse, LogEntry } from '../types';
import { IApiRouteHandler, IWorkspaceQueryStateStore } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires

@injectable()
export class ApiController implements IApiRouteHandler {
    private readonly commitViewer: IGitCommitViewDetailsCommandHandler;
    constructor(private app: Express,
        private gitServiceFactory: IGitServiceFactory,
        private serviceContainer: IServiceContainer,
        private stateStore: IWorkspaceQueryStateStore,
        private commandManager: ICommandManager) {

        this.commitViewer = this.serviceContainer.get<IGitCommitViewDetailsCommandHandler>(IGitCommitViewDetailsCommandHandler);
        this.app.get('/log', this.handleRequest(this.getLogEntries.bind(this)));
        this.app.get('/branches', this.handleRequest(this.getBranches.bind(this)));
        this.app.get('/log/:hash', this.handleRequest(this.getCommit.bind(this)));
        this.app.post('/log/clearSelection', this.handleRequest(this.clearSelectedCommit.bind(this)));
        this.app.post('/log/:hash', this.handleRequest(this.doSomethingWithCommit.bind(this)));
        this.app.post('/log/:hash/committedFile', this.handleRequest(this.selectCommittedFile.bind(this)));
    }
    // tslint:disable-next-line:no-empty member-ordering
    public dispose() { }
    // tslint:disable-next-line:cyclomatic-complexity member-ordering
    public getLogEntries = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        const currentState = this.stateStore.getState(id);

        const refresh: boolean = request.query.refresh === 'true';

        let searchText = request.query.searchText;
        if (currentState && currentState.searchText && typeof searchText !== 'string') {
            searchText = currentState.searchText;
        }
        searchText = typeof searchText === 'string' && searchText.length === 0 ? undefined : searchText;

        let pageIndex: number | undefined = request.query.pageIndex ? parseInt(request.query.pageIndex, 10) : undefined;
        if (currentState && currentState.pageIndex && typeof pageIndex !== 'number') {
            pageIndex = currentState.pageIndex;
        }

        let branch = request.query.branch;
        if (currentState && currentState.branch && (typeof branch !== 'string' || branch.trim().length === 0)) {
            branch = currentState.branch;
        }

        let pageSize: number | undefined = request.query.pageSize ? parseInt(request.query.pageSize, 10) : undefined;
        if (currentState && currentState.pageSize && (typeof pageSize !== 'number' || pageSize === 0)) {
            pageSize = currentState.pageSize;
        }

        const filePath: string | undefined = request.query.file;
        let file = filePath ? Uri.file(filePath) : undefined;
        if (currentState && currentState.file && !file) {
            file = currentState.file;
        }

        let branchSelection = request.query.pageSize ? parseInt(request.query.branchSelection, 10) as BranchSelection : undefined;
        if (currentState && currentState.branchSelection && typeof branchSelection !== 'number') {
            branchSelection = currentState.branchSelection;
        }

        let promise: Promise<LogEntries>;

        const branchesMatch = currentState && (currentState.branch === branch);
        const noBranchDefinedByClient = !currentState;
        if (!refresh && searchText === undefined && pageIndex === undefined && pageSize === undefined &&
            file === undefined &&
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
        } else if (!refresh && currentState &&
            (currentState.searchText === (searchText || '')) &&
            currentState.pageIndex === pageIndex &&
            (typeof branch === 'string' && currentState.branch === branch) &&
            currentState.pageSize === pageSize &&
            currentState.file === file &&
            currentState.entries) {

            promise = currentState.entries;
        } else {
            promise = this.getRepository(decodeURIComponent(request.query.id))
                .getLogEntries(pageIndex, pageSize, branch, searchText, file)
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
    // tslint:disable-next-line:cyclomatic-complexity
    public getBranches = (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        this.getRepository(id)
            .getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getCommit = async (request: Request, response: Response) => {
        const fileStatParserFactory = this.serviceContainer.get<IFileStatParser>(IFileStatParser);
        // tslint:disable-next-line:no-console
        console.log(fileStatParserFactory);
        const id: string = decodeURIComponent(request.query.id);
        const hash: string = request.params.hash;

        const currentState = this.stateStore.getState(id);
        let commitPromise: Promise<LogEntry | undefined>;
        // tslint:disable-next-line:possible-timing-attack
        if (currentState && currentState.lastFetchedHash === hash && currentState.lastFetchedCommit) {
            commitPromise = currentState.lastFetchedCommit;
        } else {
            commitPromise = this.getRepository(id).getCommit(hash);
            this.stateStore.updateLastHashCommit(id, hash, commitPromise);
        }

        commitPromise
            .then(data => {
                response.send(data);
                if (data && currentState) {
                    this.commitViewer.viewCommitTree(new CommitDetails(currentState!.workspaceFolder, currentState!.branch!, data!));
                }
            })
            .catch(err => {
                response.status(500).send(err);
            });
    }
    public clearSelectedCommit = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);

        await this.stateStore.clearLastHashCommit(id);
        response.send('');
    }
    public doSomethingWithCommit = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(id)!;
        const logEntry = request.body as LogEntry;
        this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(workspaceFolder, currentState.branch!, logEntry));
    }
    public selectCommittedFile = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);
        const body = request.body as { logEntry: LogEntry; committedFile: CommittedFile };
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(id)!;
        this.commandManager.executeCommand('git.commit.file.select', new FileCommitDetails(workspaceFolder, currentState.branch!, body.logEntry, body.committedFile));
    }
    // tslint:disable-next-line:no-any
    private handleRequest = (handler: (request: Request, response: Response) => void) => {
        return async (request: Request, response: Response) => {
            try {
                await handler(request, response);
            } catch (err) {
                response.status(500).send(err);
            }
        };
    }
    private getWorkspace(id: string) {
        return this.stateStore.getState(id)!.workspaceFolder;
    }
    private getRepository(id: string): IGitService {
        const workspaceFolder = this.getWorkspace(id);
        return this.gitServiceFactory.createGitService(workspaceFolder);
    }
}
