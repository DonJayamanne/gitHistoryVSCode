import { Uri, Webview } from 'vscode';
import { IAvatarProvider } from '../adapter/avatar/types';
import { GitOriginType } from '../adapter/repository/index';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CommitDetails, FileCommitDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { Avatar, IGitService, LogEntry, Ref, RefType, IPostMessage } from '../types';
import { IApplicationShell } from '../application/types';

export class ApiController {
    private readonly commitViewer: IGitCommitViewDetailsCommandHandler;
    private readonly applicationShell: IApplicationShell;
    constructor(private webview: Webview, private gitService: IGitService,
        private serviceContainer: IServiceContainer,
        private commandManager: ICommandManager) {

        this.commitViewer = this.serviceContainer.get<IGitCommitViewDetailsCommandHandler>(IGitCommitViewDetailsCommandHandler);
        this.applicationShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);

        this.webview.onDidReceiveMessage(this.postMessageParser.bind(this))
    }

    private postMessageParser = async (message: IPostMessage) => {
        try {
            const result = await this[message.cmd].bind(this)(message.payload);
            this.webview.postMessage({
                requestId: message.requestId,
                payload: result
            });
        } catch (ex) {
            this.applicationShell.showErrorMessage(ex);
            this.webview.postMessage({
                requestId: message.requestId,
                error: ex
            });
        }
    }

    // tslint:disable-next-line:no-empty member-ordering
    public dispose() { }
    // tslint:disable-next-line:cyclomatic-complexity member-ordering max-func-body-length
    public async getLogEntries(args: any)
    {
        let searchText = args.searchText;
        searchText = typeof searchText === 'string' && searchText.length === 0 ? undefined : searchText;

        let pageIndex: number | undefined = args.pageIndex ? parseInt(args.pageIndex, 10) : 0;

        let author: string | undefined = typeof args.authorFilter === 'string' ? args.authorFilter : undefined;

        let lineNumber: number | undefined = args.line ? parseInt(args.line, 10) : undefined;

        let branch = args.branchName;

        let pageSize: number | undefined = args.pageSize ? parseInt(args.pageSize, 10) : undefined;
        // When getting history for a line, then always get 10 pages, cuz `git log -L` also spits out the diff, hence slow
        if (typeof lineNumber === 'number') {
            pageSize = 10;
        }
        const filePath: string | undefined = args.file;
        let file = filePath ? Uri.file(filePath) : undefined;
           
        let entries = await this.gitService.getLogEntries(pageIndex, pageSize, branch, searchText, file, lineNumber, author);

        return {
            ...entries,
            pageIndex,
            pageSize,
        };
    }
    // tslint:disable-next-line:cyclomatic-complexity
    public async getBranches() {
        return await this.gitService.getBranches();
    }
    public async getAuthors() {
        return await this.gitService.getAuthors();
    }

    public async getCommit(args: any) {
        const hash: string = args.hash;

        const gitRoot = this.gitService.getGitRoot();
        const branch = await this.gitService.getCurrentBranch();
        
        const commit = await this.gitService.getCommit(hash);
        this.commitViewer.viewCommitTree(new CommitDetails(gitRoot, branch, commit as LogEntry));	

        return commit;
    }

    // tslint:disable-next-line:no-any
    public async getAvatars() {
        const originType = await this.gitService.getOriginType();
        if (!originType) {
            this.webview.postMessage({
                cmd: 'getAvatarsResult',
                error: 'No origin type found'
            });
            return;
        }
        const providers = this.serviceContainer.getAll<IAvatarProvider>(IAvatarProvider);
        const provider = providers.find(item => item.supported(originType));
        const genericProvider = providers.find(item => item.supported(GitOriginType.any))!;

        let avatars: Avatar[];

        if (provider) {
            avatars = await provider.getAvatars(this.gitService);
        } else {
            avatars = await genericProvider.getAvatars(this.gitService);
        }

        return avatars;
    }
    
    public async doActionRef(args: any) {
        const actionName = args.name;
        const hash = decodeURIComponent(args.hash);
        const refEntry = args.ref as Ref;
        
        switch (actionName) {
            case 'removeTag':
                await this.gitService.removeTag(refEntry.name!);
                break;
            case 'removeBranch':
                await this.gitService.removeBranch(refEntry.name!);
                break;
            case 'removeRemote':
                await this.gitService.removeRemoteBranch(refEntry.name!);
                break;
        }

        return await this.gitService.getCommit(hash);
    }

    public async doAction(args: any) {
        const gitRoot = this.gitService.getGitRoot();
        const branch = await this.gitService.getCurrentBranch();

        const actionName = args.name;
        const value: string = decodeURIComponent(args.value);
        const logEntry: LogEntry = args.logEntry;

        switch (actionName) {
            default:
                await this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(gitRoot, branch, logEntry));
                break;
            case 'newtag':
                await this.gitService.createTag(value, logEntry.hash.full);
                logEntry.refs.push({ type: RefType.Tag, name: value });
                break;
            case 'newbranch':
                await this.gitService.createBranch(value, logEntry.hash.full);
                logEntry.refs.push({ type: RefType.Head, name: value });
                break;
            case 'reset_hard':
                await this.gitService.reset(logEntry.hash.full, true);
                break;
            case 'reset_soft':
                await this.gitService.reset(logEntry.hash.full);
                break;
        }

        return logEntry;
    }

    public async doSomethingWithCommit(args: any) {
        const gitRoot = this.gitService.getGitRoot();
        const branch = await this.gitService.getCurrentBranch();
        const logEntry = args.logEntry as LogEntry;
        
        this.commandManager.executeCommand('git.commit.doSomething', new CommitDetails(gitRoot, branch, logEntry));
    }

    public async selectCommittedFile(args: any) {
        const gitRoot = this.gitService.getGitRoot();
        const branch = await this.gitService.getCurrentBranch();

        this.commandManager.executeCommand('git.commit.file.select', new FileCommitDetails(gitRoot, branch, args.logEntry, args.committedFile));
    }
}
