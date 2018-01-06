import { inject, injectable } from 'inversify';
import { ICommandManager } from '../application/types';
import { FileCommitContext, ICommand } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { IGitCompareCommandHandler } from './types';

@injectable()
export class GitCompareCommandHandler implements IGitCompareCommandHandler {
    private _previouslySelectedCommit?: FileCommitContext;

    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @inject(ICommandManager) private commandManager: ICommandManager) { }

    public get selectedCommit(): FileCommitContext | undefined {
        return this._previouslySelectedCommit;
    }

    public selectCommit(context: FileCommitContext): void {
        this._previouslySelectedCommit = context;
    }

    public async compare(context: FileCommitContext) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(context.workspaceFolder);
        const fileDiffs = await gitService.getDifferences(this.selectedCommit!.logEntry.hash.full, context.logEntry.hash.full);
        this.commandManager.executeCommand('git.commit.diff.view', this.selectedCommit!, context, fileDiffs);
    }
    public getCommitCommands(context: FileCommitContext): ICommand<FileCommitContext>[] {
        const commands: ICommand<FileCommitContext>[] = [{
            data: context,
            label: '$(git-compare) Select for comparison',
            description: '', detail: 'blah blah',
            execute: () => { this.selectCommit(context); }
        }];

        if (this.selectCommit) {
            const label = `$(git-compare) Compare with ${this.selectedCommit!.logEntry.hash.short}`;
            const description = this.selectedCommit!.logEntry.subject;
            commands.push({
                data: context,
                label, description, detail: 'blah blah',
                execute: () => this.compare(context)
            });
        }

        return commands;
    }
}
