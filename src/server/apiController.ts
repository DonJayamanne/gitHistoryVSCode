import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { IAvatarProvider } from '../adapter/avatar/types';
import { GitOriginType } from '../adapter/repository/index';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CommitDetails, FileCommitDetails, BranchDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { Avatar, BranchSelection, CommittedFile, IGitService, IGitServiceFactory, LogEntries, LogEntriesResponse, LogEntry, Ref } from '../types';
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
        this.app.post('/action/:name?', this.handleRequest(this.doAction.bind(this)));
        this.app.post('/actionref/:name?', this.handleRequest(this.doActionRef.bind(this)));
        this.app.get('/log/:hash', this.handleRequest(this.getCommit.bind(this)));
        this.app.post('/log/clearSelection', this.handleRequest(this.clearSelectedCommit.bind(this)));
        this.app.post('/log/:hash/committedFile', this.handleRequest(this.selectCommittedFile.bind(this)));
        this.app.post('/avatars', this.handleRequest(this.getAvatars.bind(this)));
        this.app.get('/authors', this.handleRequest(this.getAuthors.bind(this)));
    }
    // tslint:disable-next-line:no-empty member-ordering
    public dispose() { }
    // tslint:disable-next-line:cyclomatic-complexity member-ordering max-func-body-length
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

        let author: string | undefined = typeof request.query.author === 'string' ? request.query.author : undefined;
        if (currentState && currentState.author && typeof author !== 'string') {
            author = currentState.author;
        }

        let lineNumber: number | undefined = request.query.lineNumber ? parseInt(request.query.lineNumber, 10) : undefined;
        if (currentState && currentState.lineNumber && typeof lineNumber !== 'number') {
            lineNumber = currentState.lineNumber;
        }

        let branch = request.query.branch;
        if (currentState && currentState.branch && typeof branch !== 'string') {
            branch = currentState.branch;
        }

        let pageSize: number | undefined = request.query.pageSize ? parseInt(request.query.pageSize, 10) : undefined;
        if (currentState && currentState.pageSize && (typeof pageSize !== 'number' || pageSize === 0)) {
            pageSize = currentState.pageSize;
        }
        // When getting history for a line, then always get 10 pages, cuz `git log -L` also spits out the diff, hence slow
        if (typeof lineNumber === 'number') {
            pageSize = 10;
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
            (file === undefined || (currentState && currentState.file && currentState.file.fsPath === file.fsPath)) &&
            (author === undefined || (currentState && currentState.author === author)) &&
            currentState && currentState.entries && (branchesMatch || noBranchDefinedByClient)) {

            let selected: LogEntry | undefined;
            if (currentState.lastFetchedCommit) {
                selected = await currentState.lastFetchedCommit;
            }
            // @ts-ignore
            promise = currentState.entries.then(data => {
                // tslint:disable-next-line:no-unnecessary-local-variable
                // @ts-ignore
                const entriesResponse: LogEntriesResponse = {
                    ...data,
                    branch: currentState.branch,
                    author: currentState.author,
                    lineNumber: currentState.lineNumber,
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
            currentState.author === author &&
            currentState.lineNumber === lineNumber &&
            currentState.entries) {

            promise = currentState.entries;
        } else {
            // @ts-ignore
            promise = (await this.getRepository(decodeURIComponent(request.query.id)))
                .getLogEntries(pageIndex, pageSize, branch, searchText, file, lineNumber, author)
                .then(data => {
                    // tslint:disable-next-line:no-unnecessary-local-variable
                    // @ts-ignore
                    const entriesResponse: LogEntriesResponse = {
                        ...data,
                        branch,
                        author,
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
                pageIndex, pageSize, branch, searchText, file, branchSelection, lineNumber, author);
        }

        try {
            const data = await promise;
            response.send(data);
        } catch (err) {
            response.status(500).send(err);
        }
    }
    // tslint:disable-next-line:cyclomatic-complexity
    public getBranches = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        (await this.getRepository(id))
            .getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getAuthors = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        (await this.getRepository(id))
            .getAuthors()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getCommit = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);
        const hash: string = request.params.hash;

        const currentState = this.stateStore.getState(id);
        let commitPromise: Promise<LogEntry | undefined>;
        // tslint:disable-next-line:possible-timing-attack
        if (currentState && currentState.lastFetchedHash === hash && currentState.lastFetchedCommit) {
            commitPromise = currentState.lastFetchedCommit;
        } else {
            commitPromise = (await this.getRepository(id)).getCommit(hash);
            this.stateStore.updateLastHashCommit(id, hash, commitPromise);
        }

        commitPromise
            .then(data => {
                response.send(data);
                if (data && currentState) {
                    this.commitViewer.viewCommitTree(new CommitDetails(currentState.workspaceFolder, currentState.branch!, data));
                }
            })
            .catch(err => {
                response.status(500).send(err);
            });
    }

    // tslint:disable-next-line:no-any
    public getAvatars = async (request: Request, response: Response): Promise<any | void> => {
        const id: string = decodeURIComponent(request.query.id);
        //const users = request.body as ActionedUser[];
        try {
            const repo = await this.getRepository(id);
            const originType = await repo.getOriginType();
            if (!originType) {
                return response.send();
            }
            const providers = this.serviceContainer.getAll<IAvatarProvider>(IAvatarProvider);
            const provider = providers.find(item => item.supported(originType));
            const genericProvider = providers.find(item => item.supported(GitOriginType.any))!;

            let avatars: Avatar[];

            if (provider) {
                avatars = await provider.getAvatars(repo);
            } else {
                avatars = await genericProvider.getAvatars(repo);
            }

            response.send(avatars);
        } catch (err) {
            response.status(500).send(err);
        }
    }
    public clearSelectedCommit = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);

        await this.stateStore.clearLastHashCommit(id);
        response.send('');
    }

    public doActionRef = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(id)!;
        const actionName = request.param('name');
        //const value = decodeURIComponent(request.query.value);
        const refEntry = request.body as Ref;
        switch (actionName) {
            case 'removeTag':
                this.commandManager.executeCommand('git.commit.removeTag', new BranchDetails(workspaceFolder, currentState.branch!), refEntry.name);
                break;
        }
    }

    public doAction = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(id)!;
        const actionName = request.param('name');
        const value = decodeURIComponent(request.query.value);
        const logEntry = request.body as LogEntry;

        const gitService = await this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder, workspaceFolder);

        switch (actionName) {
            default:
                this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(workspaceFolder, currentState.branch!, logEntry));
                break;
            case 'new':
                this.commandManager.executeCommand('git.commit.doNewRef', new CommitDetails(workspaceFolder, currentState.branch!, logEntry));
                break;
            case 'newtag':
                this.commandManager.executeCommand('git.commit.createTag', new CommitDetails(workspaceFolder, currentState.branch!, logEntry), value);
                break;
            case 'newbranch':
                this.commandManager.executeCommand('git.commit.createBranch', new CommitDetails(workspaceFolder, currentState.branch!, logEntry), value);
                break;
            case 'reset_hard':
                await gitService.reset(logEntry.hash.full, true);
                break;
            case 'reset_soft':
                await gitService.reset(logEntry.hash.full);
                break;
        }
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
    private getGitRoot(id: string) {
        return this.stateStore.getState(id)!.gitRoot;
    }
    private async getRepository(id: string): Promise<IGitService> {
        const workspaceFolder = this.getWorkspace(id);
        return this.gitServiceFactory.createGitService(workspaceFolder, Uri.file(this.getGitRoot(id)));
    }
}
