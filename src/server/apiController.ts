import { Uri, Webview } from 'vscode';
import { IAvatarProvider } from '../adapter/avatar/types';
import { GitOriginType } from '../adapter/repository/index';
import { IApplicationShell } from '../application/types';
import { ICommandManager } from '../application/types/commandManager';
import { IGitCommitViewDetailsCommandHandler } from '../commandHandlers/types';
import { CommitDetails, FileCommitDetails } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { Avatar, BranchSelection, CommittedFile, IGitService, IPostMessage, LogEntry, Ref, RefType } from '../types';
import { captureTelemetry } from '../common/telemetry';
import { IWorkspaceService } from '../application/types/workspace';

export class ApiController {
    private readonly commitViewer: IGitCommitViewDetailsCommandHandler;
    private readonly applicationShell: IApplicationShell;
    private workspace: IWorkspaceService;

    constructor(
        private webview: Webview,
        private gitService: IGitService,
        private serviceContainer: IServiceContainer,
        private commandManager: ICommandManager,
    ) {
        this.commitViewer = this.serviceContainer.get<IGitCommitViewDetailsCommandHandler>(
            IGitCommitViewDetailsCommandHandler,
        );
        this.applicationShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);

        this.workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);

        this.webview.onDidReceiveMessage(this.postMessageParser.bind(this));
    }

    public async getLogEntries(args: any) {
        let searchText = args.searchText;
        searchText = typeof searchText === 'string' && searchText.length === 0 ? undefined : searchText;

        const pageIndex: number | undefined = args.pageIndex ? parseInt(args.pageIndex, 10) : 0;

        const author: string | undefined = typeof args.authorFilter === 'string' ? args.authorFilter : undefined;

        const lineNumber: number | undefined = args.line ? parseInt(args.line, 10) : undefined;

        const branches: string[] = [];

        if (args.branchSelection != BranchSelection.All) branches.push(args.branchName);

        let pageSize: number | undefined = args.pageSize ? parseInt(args.pageSize, 10) : undefined;
        // When getting history for a line, then always get 10 pages, cuz `git log -L` also spits out the diff, hence slow
        // with  git cli version 2.22 "git log -s" may be used to suppress patch output.
        // See https://github.com/git/git/commit/9f607cd09c4c953d76de4bd18ba1c9bf6cf383cd
        if (typeof lineNumber === 'number') {
            pageSize = 10;
        }
        const filePath: string | undefined = args.file;
        const file = filePath ? Uri.file(filePath) : undefined;

        const entries = await this.gitService.getLogEntries(
            pageIndex,
            pageSize,
            branches,
            searchText,
            file,
            lineNumber,
            author,
        );

        return {
            ...entries,
            pageIndex,
            pageSize,
        };
    }
    public async getBranches() {
        return this.gitService.getBranches(
            this.workspace.getConfiguration('gitHistory').get<boolean>('includeRemoteBranches', false),
        );
    }
    public async getAuthors() {
        return this.gitService.getAuthors();
    }
    public async getCommit(args: any) {
        const hash: string = args.hash;

        const gitRoot = this.gitService.getGitRoot();
        const branch = this.gitService.getCurrentBranch();

        const commit = await this.gitService.getCommit(hash);
        this.commitViewer.viewCommitTree(new CommitDetails(gitRoot, branch, commit as LogEntry));

        return commit;
    }

    @captureTelemetry()
    public async getAvatars() {
        const originType = await this.gitService.getOriginType();
        if (!originType) {
            this.webview.postMessage({
                cmd: 'getAvatarsResult',
                error: 'No origin type found',
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

    @captureTelemetry()
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
            case 'checkoutBranch':
                await this.gitService.checkout(refEntry.name!);
                break;
            case 'removeRemote':
                await this.gitService.removeRemoteBranch(refEntry.name!);
        }

        return this.gitService.getCommit(hash, true);
    }

    @captureTelemetry()
    public async doAction(args: any) {
        const gitRoot = this.gitService.getGitRoot();
        const branch = this.gitService.getCurrentBranch();

        const actionName = args.name;
        const value: string = decodeURIComponent(args.value);
        const logEntry: LogEntry = args.logEntry;

        switch (actionName) {
            default:
                await this.commandManager.executeCommand(
                    'git.commit.doSomething',
                    new CommitDetails(gitRoot, branch, logEntry),
                );
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
        }

        return logEntry;
    }

    @captureTelemetry()
    public async doActionFile(args: any) {
        const actionName = args.name;
        const logEntry = args.logEntry as LogEntry;
        const committedFile = args.committedFile as CommittedFile;

        const gitRoot = this.gitService.getGitRoot();
        const branch = this.gitService.getCurrentBranch();

        const fileCommitDetails = new FileCommitDetails(gitRoot, branch, logEntry, committedFile);

        switch (actionName) {
            default:
            case 'view':
                await this.commandManager.executeCommand('git.commit.FileEntry.ViewFileContents', fileCommitDetails);
                break;
            case 'compare_workspace':
                await this.commandManager.executeCommand(
                    'git.commit.FileEntry.CompareAgainstWorkspace',
                    fileCommitDetails,
                );
                break;
            case 'compare_previous':
                await this.commandManager.executeCommand(
                    'git.commit.FileEntry.CompareAgainstPrevious',
                    fileCommitDetails,
                );
                break;
            case 'history':
                await this.commandManager.executeCommand('git.viewFileHistory', Uri.file(committedFile.uri.path));
                break;
        }

        return committedFile;
    }

    private postMessageParser = async (message: IPostMessage) => {
        try {
            const result = await this[message.cmd].bind(this)(message.payload);
            this.webview.postMessage({
                requestId: message.requestId,
                payload: result,
            });
        } catch (ex) {
            this.applicationShell.showErrorMessage((ex as Error).message);
            this.webview.postMessage({
                requestId: message.requestId,
                error: ex,
            });
        }
    };
}
