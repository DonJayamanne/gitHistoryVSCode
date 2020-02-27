import { inject, injectable } from 'inversify';
import { IApplicationShell } from '../../application/types';
import { CommitDetails, IUiService } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitCommitCommandHandler } from '../types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @inject(IApplicationShell) private applicationShell: IApplicationShell,
    ) {}

    @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(commit: CommitDetails) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(commit);
        if (cmd) {
            return cmd.execute();
        }
    }

    @command('git.commit.createTag', IGitCommitCommandHandler)
    public async createTagFromCommit(commit: CommitDetails, newTagName?: string) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const msg = 'Tag name';
        const description = 'Please provide a tag name';
        newTagName =
            typeof newTagName !== 'string' || newTagName.trim().length === 0
                ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description })
                : newTagName;

        if (typeof newTagName !== 'string' || newTagName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer
            .get<IGitServiceFactory>(IGitServiceFactory)
            .createGitService(commit.workspaceFolder);
        await gitService.createTag(newTagName, commit.logEntry.hash.full);
    }

    @command('git.commit.createBranch', IGitCommitCommandHandler)
    public async createBranchFromCommit(commit: CommitDetails, newBranchName?: string) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const msg = 'Branch name';
        const description = 'Please provide a branch name';
        newBranchName =
            typeof newBranchName !== 'string' || newBranchName.trim().length === 0
                ? await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description })
                : newBranchName;

        if (typeof newBranchName !== 'string' || newBranchName.length === 0) {
            return;
        }

        const gitService = await this.serviceContainer
            .get<IGitServiceFactory>(IGitServiceFactory)
            .createGitService(commit.workspaceFolder);
        gitService.createBranch(newBranchName, commit.logEntry.hash.full);
    }

    @command('git.commit.selected', IGitCommitCommandHandler)
    public async onCommitSelected(commit: CommitDetails) {
        const viewer = this.commitViewerFactory.getCommitViewer();
        viewer.showCommit(commit);
        viewer.showCommitTree(commit);
    }
}
