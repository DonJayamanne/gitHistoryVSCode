import { inject, injectable } from 'inversify';
import { IApplicationShell, ICommandManager } from '../../application/types';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { command } from '../registration';
import { IGitCompareCommandHandler } from '../types';

@injectable()
export class GitCompareCommitCommandHandler implements IGitCompareCommandHandler {
    private _previouslySelectedCommit?: CommitDetails;

    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IApplicationShell) private application: IApplicationShell) { }

    public get selectedCommit(): CommitDetails | undefined {
        return this._previouslySelectedCommit;
    }

    @command('git.commit.selectForComparison', IGitCompareCommandHandler)
    public async select(commit: CommitDetails): Promise<void> {
        await this.commandManager.executeCommand('setContext', 'git.commit.FileEntry.selectForComparison', true);
        this._previouslySelectedCommit = commit;
    }

    @command('git.commit.compare', IGitCompareCommandHandler)
    public async compare(commit: CommitDetails): Promise<void> {
        if (!this.selectedCommit) {
            await this.application.showErrorMessage('Please select another file to compare with');
            return;
        }
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        const fileDiffs = await gitService.getDifferences(this.selectedCommit!.logEntry.hash.full, commit.logEntry.hash.full);
        await this.commandManager.executeCommand('git.commit.diff.view', this.selectedCommit!, commit, fileDiffs);
    }
}
