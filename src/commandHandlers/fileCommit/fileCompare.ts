import { inject, injectable } from 'inversify';
import { IApplicationShell, ICommandManager } from '../../application/types';
import { FileCommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { FileNode } from '../../nodes/types';
import { IGitServiceFactory } from '../../types';
import { command } from '../registration';
import { IGitCompareFileCommandHandler } from '../types';

@injectable()
export class GitCompareFileCommitCommandHandler implements IGitCompareFileCommandHandler {
    private _previouslySelectedCommit?: FileCommitDetails;

    constructor(
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager,
        @inject(IApplicationShell) private application: IApplicationShell,
    ) {}

    public get selectedCommit(): FileCommitDetails | undefined {
        return this._previouslySelectedCommit;
    }

    @command('git.commit.FileEntry.selectForComparison', IGitCompareFileCommandHandler)
    public async select(nodeOrFileCommit: FileNode | FileCommitDetails): Promise<void> {
        const fileCommit = nodeOrFileCommit instanceof FileCommitDetails ? nodeOrFileCommit : nodeOrFileCommit.data!;
        await this.commandManager.executeCommand('setContext', 'git.commit.FileEntry.selectForComparison', true);
        this._previouslySelectedCommit = fileCommit;
    }

    @command('git.commit.FileEntry.compare', IGitCompareFileCommandHandler)
    public async compare(nodeOrFileCommit: FileNode | FileCommitDetails): Promise<void> {
        if (!this.selectedCommit) {
            await this.application.showErrorMessage('Please select another file to compare with');
            return;
        }
        const fileCommit = nodeOrFileCommit instanceof FileCommitDetails ? nodeOrFileCommit : nodeOrFileCommit.data!;
        const gitService = await this.serviceContainer
            .get<IGitServiceFactory>(IGitServiceFactory)
            .createGitService(fileCommit.workspaceFolder);
        const fileDiffs = await gitService.getDifferences(
            this.selectedCommit.logEntry.hash.full,
            fileCommit.logEntry.hash.full,
        );
        await this.commandManager.executeCommand('git.commit.diff.view', this.selectedCommit!, fileCommit, fileDiffs);
    }
}
