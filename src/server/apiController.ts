import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
import { Uri } from 'vscode';
import { IAvatarProvider } from '../adapter/avatar/types';
import { GitOriginType } from '../adapter/repository/index';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CommitDetails, FileCommitDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { Avatar, CommittedFile, IGitService, IGitServiceFactory, LogEntries, LogEntriesResponse, LogEntry, Ref, RefType } from '../types';
import { IApiRouteHandler } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires

@injectable()
export class ApiController implements IApiRouteHandler {
    private readonly commitViewer: IGitCommitViewDetailsCommandHandler;
    constructor(private app: Express,
        private gitServiceFactory: IGitServiceFactory,
        private serviceContainer: IServiceContainer,
        private commandManager: ICommandManager) {

        this.commitViewer = this.serviceContainer.get<IGitCommitViewDetailsCommandHandler>(IGitCommitViewDetailsCommandHandler);

        this.app.get('/log', this.handleRequest(this.getLogEntries.bind(this)));
        this.app.get('/branches', this.handleRequest(this.getBranches.bind(this)));
        this.app.post('/action/:name?', this.handleRequest(this.doAction.bind(this)));
        this.app.post('/actionref/:name?', this.handleRequest(this.doActionRef.bind(this)));
        this.app.get('/log/:hash', this.handleRequest(this.getCommit.bind(this)));
        this.app.post('/log/:hash', this.handleRequest(this.doSomethingWithCommit.bind(this)));
        this.app.post('/log/:hash/committedFile', this.handleRequest(this.selectCommittedFile.bind(this)));
        this.app.post('/avatars', this.handleRequest(this.getAvatars.bind(this)));
        this.app.get('/authors', this.handleRequest(this.getAuthors.bind(this)));
    }
    // tslint:disable-next-line:no-empty member-ordering
    public dispose() { }
    // tslint:disable-next-line:cyclomatic-complexity member-ordering max-func-body-length
    public getLogEntries = async (request: Request, response: Response) => {
        let searchText = request.query.searchText;
        searchText = typeof searchText === 'string' && searchText.length === 0 ? undefined : searchText;

        let pageIndex: number | undefined = request.query.pageIndex ? parseInt(request.query.pageIndex, 10) : undefined;

        let author: string | undefined = typeof request.query.author === 'string' ? request.query.author : undefined;

        let lineNumber: number | undefined = request.query.lineNumber ? parseInt(request.query.lineNumber, 10) : undefined;

        let branch = request.query.branch;

        let pageSize: number | undefined = request.query.pageSize ? parseInt(request.query.pageSize, 10) : undefined;
        // When getting history for a line, then always get 10 pages, cuz `git log -L` also spits out the diff, hence slow
        if (typeof lineNumber === 'number') {
            pageSize = 10;
        }
        const filePath: string | undefined = request.query.file;
        let file = filePath ? Uri.file(filePath) : undefined;

        let promise: Promise<LogEntries>;
            
        // @ts-ignore
        promise = (await this.getRepository(decodeURIComponent(request.query.id)))
            .getLogEntries(pageIndex, pageSize, branch, searchText, file, lineNumber, author)
            .then(data => {
                // tslint:disable-next-line:no-unnecessary-local-variable
                // @ts-ignore
                const entriesResponse: LogEntriesResponse = {
                    ...data,
                    pageIndex,
                    pageSize,
                };
                return entriesResponse;
            });

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
        
        try {
            const branches = await (await this.getRepository(id)).getBranches();
            response.send(branches);
        }catch (err) {
            response.status(500).send(err);
        }
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

        const gitService = await this.getRepository(id);
        const gitRoot = await gitService.getGitRoot();
        const branch = await gitService.getCurrentBranch();
        
        try {
            let commitPromise = await gitService.getCommit(hash);

            this.commitViewer.viewCommitTree(new CommitDetails(gitRoot, branch, commitPromise as LogEntry));	

            response.send(commitPromise);
        } catch (err) {
            response.status(500).send(err);
        }
    }

    // tslint:disable-next-line:no-any
    public getAvatars = async (request: Request, response: Response): Promise<any | void> => {
        const id: string = decodeURIComponent(request.query.id);
        //const users = request.body as ActionedUser[];
        try {
            const gitService = await this.getRepository(id);
            const originType = await gitService.getOriginType();
            if (!originType) {
                return response.send();
            }
            const providers = this.serviceContainer.getAll<IAvatarProvider>(IAvatarProvider);
            const provider = providers.find(item => item.supported(originType));
            const genericProvider = providers.find(item => item.supported(GitOriginType.any))!;

            let avatars: Avatar[];

            if (provider) {
                avatars = await provider.getAvatars(gitService);
            } else {
                avatars = await genericProvider.getAvatars(gitService);
            }

            response.send(avatars);
        } catch (err) {
            response.status(500).send(err);
        }
    }
    
    public doActionRef = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);

        const gitService = await this.getRepository(id);

        const actionName = request.param('name');
        //const hash = decodeURIComponent(request.query.hash);
        const refEntry = request.body as Ref;
        
        try {
            switch (actionName) {
                case 'removeTag':
                    await gitService.removeTag(refEntry.name!);
                    break;
                case 'removeBranch':
                    await gitService.removeBranch(refEntry.name!);
                    break;
                case 'removeRemote':
                    await gitService.removeRemoteBranch(refEntry.name!);
                    break;
            }
            response.status(200).send('');
        } catch (err) {
            response.status(500).send(err);
        }
    }

    public doAction = async (request: Request, response: Response) => {
        const id: string = decodeURIComponent(request.query.id);

        const gitService = await this.getRepository(id);
        const gitRoot = await gitService.getGitRoot();
        const branch = await gitService.getCurrentBranch();

        const actionName = request.param('name');
        const value = decodeURIComponent(request.query.value);
        const logEntry = request.body as LogEntry;

        try {
            switch (actionName) {
                default:
                    await this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(gitRoot, branch, logEntry));
                    break;
                case 'newtag':
                    await gitService.createTag(value, logEntry.hash.full);
                    logEntry.refs.push({ type: RefType.Tag, name: value });
                    break;
                case 'newbranch':
                    await gitService.createBranch(value, logEntry.hash.full);
                    logEntry.refs.push({ type: RefType.Head, name: value });
                    break;
                case 'reset_hard':
                    await gitService.reset(logEntry.hash.full, true);
                    break;
                case 'reset_soft':
                    await gitService.reset(logEntry.hash.full);
                    break;
            }
            response.status(200).send(logEntry);
        } catch(err) {
            response.status(500).send(err);
        }
    }

    public doSomethingWithCommit = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);

        const gitService = await this.getRepository(id);
        const gitRoot = await gitService.getGitRoot();
        const branch = await gitService.getCurrentBranch();

        const logEntry = request.body as LogEntry;
        this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(gitRoot, branch, logEntry));
    }

    public selectCommittedFile = async (request: Request, response: Response) => {
        response.status(200).send('');
        const id: string = decodeURIComponent(request.query.id);

        const gitService = await this.getRepository(id);
        const gitRoot = await gitService.getGitRoot();
        const branch = await gitService.getCurrentBranch();

        const body = request.body as { logEntry: LogEntry; committedFile: CommittedFile };

        this.commandManager.executeCommand('git.commit.file.select', new FileCommitDetails(gitRoot, branch, body.logEntry, body.committedFile));
    }
    // tslint:disable-next-line:no-any
    private handleRequest = (handler: (request: Request, response: Response) => void) => {
        return async (request: Request, response: Response) => {
            try {
                // tslint:disable-next-line:await-promise
                await handler(request, response);
            } catch (err) {
                response.status(500).send(err);
            }
        };
    }
    private async getRepository(id: string): Promise<IGitService> {
        const index = parseInt(id);
        return this.gitServiceFactory.getService(index);
    }
}
