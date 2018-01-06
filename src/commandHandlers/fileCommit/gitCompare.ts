import { inject, injectable } from 'inversify';
import { ICommandManager } from '../../application/types';
import { FileCommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { IGitCompareCommandHandler } from '../types';

@injectable()
export class GitCompareCommandHandler implements IGitCompareCommandHandler {
    private _previouslySelectedCommit?: FileCommitDetails;

    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    public get selectedCommit(): FileCommitDetails | undefined {
        return this._previouslySelectedCommit;
    }

    public selectCommit(fileCommit: FileCommitDetails): void {
        this._previouslySelectedCommit = fileCommit;
    }

    public async compare(fileCommit: FileCommitDetails) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(fileCommit.workspaceFolder);
        const fileDiffs = await gitService.getDifferences(this.selectedCommit!.logEntry.hash.full, fileCommit.logEntry.hash.full);
        this.commandManager.executeCommand('git.commit.diff.view', this.selectedCommit!, fileCommit, fileDiffs);
    }
    // public getCommitCommands(fileCommit: FileCommitDetails): ICommand<FileCommitDetails>[] {
    //     const commands: ICommand<FileCommitDetails>[] = [{
    //         data: fileCommit,
    //         label: '$(git-compare) Select for comparison',
    //         description: '', detail: 'blah blah',
    //         execute: () => { this.selectCommit(fileCommit); }
    //     }];

    //     if (this.selectCommit) {
    //         const label = `$(git-compare) Compare with ${this.selectedCommit!.logEntry.hash.short}`;
    //         const description = this.selectedCommit!.logEntry.subject;
    //         commands.push({
    //             data: fileCommit,
    //             label, description, detail: 'blah blah',
    //             execute: () => this.compare(fileCommit)
    //         });
    //     }

    //     return commands;
    // }
}
